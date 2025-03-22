

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
      fields: "files(id,name,  mimeType)",
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
  if (!host) return res.redirect('https://app.copyei.com/error?message=Host não encontrado');

  /* Ignore API endpoints */
  if (host === "api.copyei.com") return next();

  if (host.includes(".zr0.online")) {
    /* Obter caminho relativo, com o index.html sendo o default */
    const requestPath = req.path === "/" ? "index.html" : req.path.substring(1);
    const pathSegments = requestPath.split("/");

    // try {
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
        return res.redirect('https://app.copyei.com/error?message=Credenciais inválidas ou ausentes para o usuário.');
        
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
        // const metadata = await drive.files.get({
        //   fileId,
        //   fields: "id, name, mimeType", 
        // });
        mimeType = metadata.data.mimeType || mimeType;
      
        const fileStream = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );

        res.setHeader("Content-Type", mimeType);
        return fileStream.data.pipe(res);
      
    } catch (error) {
      /* Logar erro apenas em ambiente de desenvolvimento */
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao renderizar a página:', error)
      }

      let errorMessage = "Erro desconhecido";
      let errorCode = 500; 
    
      

      if (error.response && error.response.data && error.response.data.error) {
        const googleError = error.response.data.error;
        console.log(googleError, "entrou")
        errorCode = googleError.code || 500;
        errorMessage = googleError.message || "Erro desconhecido";
    
        
        if (googleError.code === 403 || googleError.code === 400 ) {
          errorMessage = "O arquivo foi identificado como malware ou spam pelo GOOGLE DRIVE e não pode ser baixado.";
        } else if (googleError.code === 404) {
          errorMessage = "O arquivo solicitado não foi encontrado.";
        } else if (googleError.code === 401) {
          errorMessage = "Credenciais inválidas. Faça login novamente.";
        }
    
      
    }

    return res.redirect(`https://app.copyei.com/error?message=${errorMessage}`)
  }

  }

  return next();

}
