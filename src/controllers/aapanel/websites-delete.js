import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import axios from "axios";
import https from "https";
import { z, ZodError } from "zod";
import { google } from "googleapis";

import { prisma } from "../../../src/lib/prisma.js";
import { aaPanelSignature } from "../../utils/aaPanelSignature.js";
import { oauth2Client } from "../../lib/google-oauth.js";
import { getValidAccessToken } from "../../utils/getGoogleAccessToken.js";

const aaPanelWebsitesDeleteParams = z.object({
  websiteId: z.coerce.number(),
});

export async function aaPanelWebsitesDelete(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    console.log(user);
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Validar o corpo da requisição */
    const { websiteId } = aaPanelWebsitesDeleteParams.parse(req.params);

    /* Verificar se o Site existe */
    const website = await prisma.websites.findUnique({
      where: {
        id: websiteId,
        user_id: user.id,
      },
      include: {
        Domain: true,
      },
    });
    if (!website)
      return res.status(400).json({ message: "Site não encontrado" });
    // if (website.status === "CLONING")
    //   return res.status(400).json({ message: "Clonagem em andamento" });

    // TODO: Refactor Domain System
    /* Definir caminhos dos diretórios */
    const domain = website.title;
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      domain
    );

    /* Deletar website quando estiver no servidor da Copyei */
    const hasDirectory = existsSync(siteDirectory);
    /* Verificar se o diretório existe, e caso exista, deletar o diretório do site clonado */
    if (hasDirectory) {
      await fs.access(siteDirectory);
      await fs.rm(siteDirectory, { recursive: true });
    }

    /* Deletar registro no banco de dados */
    await prisma.websites.delete({
      where: {
        id: websiteId,
        user_id: user.id,
      },
    });

    /* Deletar website quando estiver no Google Drive */
    if (website.type === "DRIVE" && website.driveFolderId) {
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
      await drive.files.delete({ fileId: website.driveFolderId });
    }

    // TODO: Refactor Domain System
    /* Deletar registro no aaPanel, caso exista */
    // if (process.env.NODE_ENV === "production") {
    //   /* aaPanel Ação */
    //   const url = `${process.env.AAPANEL_ENDPOINT}/site?action=DeleteSite`;

    //   /* Obter a chave necessária para a comunicação com o aaPanel */
    //   const pData = aaPanelSignature();

    //   /* Parâmetros necessários para a requisição */
    //   pData.domain = domain;
    //   pData.webname = domain;

    //   const httpsAgent = new https.Agent({
    //     rejectUnauthorized: false,
    //   });

    //   /* Enviar Requisição ao aaPanel */
    //   await axios.post(url, new URLSearchParams(pData), {
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //     },
    //     httpsAgent,
    //   });
    // }

    return res.status(200).json({ message: "Site deletado com sucesso" });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao deletar site no aaPanel" });
  }
}
