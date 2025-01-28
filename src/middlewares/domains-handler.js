import { google } from "googleapis";
import jwt from "jsonwebtoken";

import { oauth2Client } from "../lib/google-oauth.js";
import { prisma } from "../lib/prisma.js";

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
    /* Validar cookie do Google Drive */
    const { copyei_drive } = req.cookies;
    if (!copyei_drive)
      return res
        .status(400)
        .json({ message: "O usuário precisa logar com o Google" });

    /* Decodificar token JWT */
    const decoded = jwt.verify(copyei_drive, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Not Authorized" });

    /* Obter instância do Google Drive */
    oauth2Client.setCredentials(decoded);
    const drive = google.drive({ version: "v3", auth: oauth2Client });

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
        },
      });
      if (!website || website.type !== "DRIVE" || !website.driveFolderId)
        return next();

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
