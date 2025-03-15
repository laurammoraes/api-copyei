import { existsSync } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { uploadToDrive } from "../../queue/sendWebsiteToDriveQueue.js";
import { refreshOauthToken, validateOauthToken } from "../../lib/google-oauth.js";

export async function uploadWebsiteToDrive(req, res) {
  /* Validar usuário */
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Não autorizado" });

  /* Validar cookie do Google Drive */
  const { copyei_drive } = req.cookies;
  if (!copyei_drive)
    return res
      .status(400)
      .json({ message: "O usuário precisa logar com o Google" });

  /* Obter id do website */
  const { websiteDomain } = req.params;
  if (!websiteDomain)
    return res.status(400).json({ message: "Site não encontrado" });

  /* Obter website */
  const website = await prisma.websites.findUnique({
    where: {
      title: websiteDomain,
    },
  });

  if (!website) return res.status(400).json({ message: "Site não encontrado" });

  /* Verificar se é o proprietário do site que está fazendo essa requisição */
  if (website.user_id !== user.id)
    return res.status(400).json({ message: "Não autorizado" });

  /* Verificar se o site já está no Google Drive */
  if (website.type === "DRIVE" || website.driveFolderId)
    return res
      .status(400)
      .json({ message: "Esse site já está no Google Drive" });

  /* Definir o caminho do arquivo para fazer upload */
  const websiteDirectory = path.join(
    process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
    websiteDomain
  );

  /* Verificar se o diretório existe */
  if (!existsSync(websiteDirectory)) {
    return res.status(400).json({ message: "Arquivo local não encontrado" });
  }

  /* Validar JWT token */
  const decoded = jwt.verify(copyei_drive, process.env.JWT_SECRET);

  if (!decoded) {
    res.clearCookie("copyei_drive");
    return res.status(401).json({ message: "Not Authorized" });
  }

  try {

    const tokens = await validateToken(decoded, user)

    const jwtToken = jwt.sign(tokens, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("copyei_drive", jwtToken, {
      expiresIn: "1d",
    });

    /* Enviar para fila de clonagem */
    await uploadToDrive(websiteDomain, decoded);

    

    

    return res.json({ message: "OK" });
  } catch (error) {
    console.error(error);
    res.clearCookie("copyei_drive");
    return res
      .status(500)
      .json({ message: "Erro ao fazer upload do site no Google Drive" });
  }

  async function validateToken(driveDecodedToken, user) {
    try {
      const isValidated = await validateOauthToken(driveDecodedToken.access_token)

      if (isValidated) {
        const {
          iat,
          exp,
          ...rest
        } = driveDecodedToken
        return rest
      }

      const credentials = await refreshOauthToken(driveDecodedToken.access_token, driveDecodedToken.refresh_token)

      const { access_token, refresh_token, expiry_date } = credentials

      await prisma.googleCredentials.upsert({
        where: {
          user_id: user.id,
        },
        create: {
          user_id: user.id,
          refresh_token: refresh_token,
          access_token: access_token,
          expires_at: new Date(expiry_date),
        },
        update: {
          refresh_token: refresh_token,
          access_token: access_token,
          expires_at: new Date(expiry_date),
        },
      });

      return credentials;

    } catch (error) {

      console.error("Erro ao renovar token:", error);
      throw new Error("Falha na renovação do token");
    }
  }
}
