

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
  const host = req.headers.host ? req.headers.host.split(":")[0] : null;
  if (!host) return res.redirect(process.env.APP_BASE_URL);

  if (host === "api.copyei.com") return next();

  if (host.includes(".zr0.online")) {
    const requestPath = req.path === "/" ? "index.html" : req.path.substring(1);
    const pathSegments = requestPath.split("/");

    try {
      const websiteTitle = host.split(".")[0];
      if (!websiteTitle) {
        return res.status(400).json({ error: "Título do site inválido." });
      }

      const website = await prisma.websites.findUnique({
        where: { title: websiteTitle },
        select: { type: true, driveFolderId: true, user_id: true },
      });

      if (!website || website.type !== "DRIVE" || !website.driveFolderId) {
        return res.status(404).render("errorPage", { message: "Site não encontrado." });
      }

      const userGoogleCredentials = await getValidAccessToken(website.user_id);

      if (!userGoogleCredentials.access_token || !userGoogleCredentials.refresh_token) {
        return res.status(403).render("errorPage", { message: "Credenciais inválidas ou ausentes." });
      }

      oauth2Client.setCredentials({
        access_token: userGoogleCredentials.access_token,
        refresh_token: userGoogleCredentials.refresh_token,
      });
      const drive = google.drive({ version: "v3", auth: oauth2Client });
      const DRIVE_FOLDER_ID = website.driveFolderId;

      const fileId = await getFileIdByPath(drive, DRIVE_FOLDER_ID, pathSegments);

      let mimeType = "application/octet-stream";
      try {
        const metadata = await drive.files.get({ fileId, fields: "name, mimeType" });
        mimeType = metadata.data.mimeType || mimeType;
      } catch (error) {
        console.error("Erro ao obter metadados do arquivo:", error);
        return res.status(404).render("errorPage", { message: "Arquivo não encontrado." });
      }

      try {
        const fileStream = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );

        res.setHeader("Content-Type", mimeType);
        return fileStream.data.pipe(res);
      } catch (error) {
        console.error("Erro ao obter conteúdo do arquivo:", error);
        return res.status(500).render("errorPage", { message: "Erro ao carregar o arquivo." });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erro inesperado:", error);
      }

      return res.status(500).render("errorPage", { message: "Erro interno do servidor." });

    }
  }
  return next();
}
