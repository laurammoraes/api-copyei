

import { google } from "googleapis";

import { oauth2Client } from "../lib/google-oauth.js";
import { prisma } from "../lib/prisma.js";
import { getValidAccessToken } from "../utils/getGoogleAccessToken.js";

/* Obter arquivo do drive pelo path */
async function getFileIdByPath(drive, folderId, pathSegments) {
  let currentFolderId = folderId;

  for (const segment of pathSegments) {
    const response = await drive.files.list({
      q: `'${currentFolderId}' in parents and name = '${segment}' and trashed = false`,
      fields: "files(id, mimeType)",
    });

    const files = response.data.files;

    /* Retornar nulo em caso de não encontrar nenhum arquivo no segmento fornecido */
    if (files.length === 0) return null;

    currentFolderId = files[0].id;
  }

  return currentFolderId;
}

export async function domainsHandler(req, res, next) {
  /* Verificar se o cabeçalho 'host' existe */
  const host = req.headers.host ? req.headers.host.split(":")[0] : null;
  if (!host) return res.redirect(process.env.APP_BASE_URL);

  /* Ignore API endpoints */
  if (host === "api.copyei.com") return next();

  if (host.includes(".zr0.online")) {
    /* Obter caminho relativo, com o index.html sendo o default */
    const requestPath = req.path === "/" ? "index.html" : req.path.substring(1);
    const pathSegments = requestPath.split("/");

    try {
      const websiteTitle = host.split(".")[0];
      if (!websiteTitle) return res.redirect(process.env.APP_BASE_URL);

      const website = await prisma.websites.findUnique({
        where: {
          title: websiteTitle,
        },
        select: {
          type: true,
          driveFolderId: true,
          user_id: true,
        },
      });


      if (!website || website.type !== "DRIVE" || !website.driveFolderId)
        return res.redirect(process.env.APP_BASE_URL);

      const userGoogleCredentials = await getValidAccessToken(website.user_id);

      /* Validar credenciais antes de configurá-las */
      if (
        !userGoogleCredentials.access_token ||
        !userGoogleCredentials.refresh_token
      ) {
        throw new Error("Credenciais inválidas ou ausentes para o usuário.");
      }

      /* Obter instância do Google Drive */
      oauth2Client.setCredentials({
        access_token: userGoogleCredentials.access_token,
        refresh_token: userGoogleCredentials.refresh_token,
      });
      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const DRIVE_FOLDER_ID = website.driveFolderId;

      /* Obter id do arquivo no Google Drive */

      const fileId = await getFileIdByPath(drive, DRIVE_FOLDER_ID, pathSegments);

      /* Obter tipo do arquivo */
      let mimeType = "application/octet-stream";
      try {
        const metadata = await drive.files.get({
          fileId,
          fields: "name, mimeType",
        });
        mimeType = metadata.data.mimeType || mimeType;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new Error("Arquivo não encontrado no Google Drive.");
        } else {
          throw new Error("Erro ao obter metadados do arquivo: " + error.message);
        }
      }

      /* Retornar conteúdo do arquivo para o cliente */
      try {
        const fileStream = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );

        res.setHeader("Content-Type", mimeType);
        return fileStream.data.pipe(res);
      } catch (error) {
        throw new Error("Erro ao obter conteúdo do arquivo: " + error.message);
      }

    } catch (error) {
      /* Logar erro apenas em ambiente de desenvolvimento */
      if (process.env.NODE_ENV === "development") {
        console.error(error);
      }
      return res.redirect(process.env.APP_BASE_URL);
    }
  }

  return next();
}
