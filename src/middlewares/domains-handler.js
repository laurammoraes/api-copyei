import { google } from "googleapis";
import jwt from "jsonwebtoken";

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

    if (files.length === 0) {
      throw new Error(`Arquivo não encontrado: ${segment}`);
    }

    currentFolderId = files[0].id;
  }

  return currentFolderId;
}

export async function domainsHandler(req, res, next) {
  /* Get host and path from header */
  const host = req.headers.host.split(":")[0];

  /* Ignore API endpoints */
  if (host === "api.copyei.com") return next();

  if (host.includes(".zr0.online")) {
    /* Obter caminho relativo, com o index.html sendo o default */
    const requestPath = req.path === "/" ? "index.html" : req.path.substring(1);
    const pathSegments = requestPath.split("/");

    try {
      const websiteTitle = host.split(".")[0];
      if (!websiteTitle) return next();

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
        return next();

      const userGoogleCredentials = await getValidAccessToken(website.user_id);

      /* Obter instância do Google Drive */
      oauth2Client.setCredentials({
        access_token: userGoogleCredentials.access_token,
        refresh_token: userGoogleCredentials.refresh_token,
      });
      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const DRIVE_FOLDER_ID = website.driveFolderId;

      /* Obter id do arquivo no Google Drive */
      const fileId = await getFileIdByPath(
        drive,
        DRIVE_FOLDER_ID,
        pathSegments
      );

      /* Obter tipo do arquivo */
      const metadata = await drive.files.get({
        fileId,
        fields: "name, mimeType",
      });
      const mimeType = metadata.data.mimeType || "application/octet-stream";

      /* Retornar conteúdo do arquivo para o cliente */
      const fileStream = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );

      res.setHeader("Content-Type", mimeType);
      fileStream.data.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(404).send("Arquivo não encontrado");
    }
  }

  return next();
}
