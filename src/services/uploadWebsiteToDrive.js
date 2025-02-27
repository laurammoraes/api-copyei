import { google } from "googleapis";
import { existsSync, createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

import { oauth2Client } from "../lib/google-oauth.js";
import { prisma } from "../lib/prisma.js";
import { removeWatermark } from "../utils/removeWatermark.js";
import { removeEditabilityFromSite } from "../utils/removeEditabilityFromSite.js";
import { updateLoadingState } from "./websocket.js";


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTokenExpired(token) {
  const now = Math.floor(Date.now() / 1000); // Tempo atual em segundos
  return token.exp && token.exp < now;
}

async function refreshToken() {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    throw new Error("Falha na renovação do token");
  }
}

async function createPublicFile(drive, fileMetadata, media) {
  try {
    const fileResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    
    await sleep(1000);


    await drive.permissions.create({
      fileId: fileResponse.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log(`Arquivo ${fileMetadata.name} enviado e tornado público.`);
  } catch (error) {
    console.error(`Erro ao criar o arquivo ${fileMetadata.name}: ${error.message}`);
  }
}

async function uploadFolderToDrive(drive, localPath, driveParentId) {

  const entries = await fs.readdir(localPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(localPath, entry.name);


    if (entry.isDirectory()) {

      const folderMetadata = {
        name: entry.name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [driveParentId],
      };


      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      const folderId = folderResponse.data.id;

      
      await uploadFolderToDrive(drive, entryPath, folderId);
    } else if (entry.isFile()) {
    
      const fileMetadata = {
        name: entry.name,
        parents: [driveParentId],
      };
      const media = {
        mimeType: mime.lookup(entryPath) || "application/octet-stream",
        body: createReadStream(entryPath),
      };

      await createPublicFile(drive, fileMetadata, media);
      
    }
  }
}

export async function uploadWebsiteToDrive(websiteDomain, decodedJWT) {

  if (isTokenExpired(decodedJWT)) {
    console.log("Token expirado, renovando...");
    decodedJWT = await refreshToken();
  }

  oauth2Client.setCredentials(decodedJWT);
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  
  const websiteDirectory = path.join(
    process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
    websiteDomain
  );

  
  if (!existsSync(websiteDirectory)) {
    throw new Error("Arquivo local não encontrado");
  }

  
  await removeWatermark(websiteDirectory);

  
  await removeEditabilityFromSite(websiteDirectory);


  

  try {
    const folderMetadata = {
      name: `www.copyei-${websiteDomain}`,
      mimeType: "application/vnd.google-apps.folder",
    };


    const folderResponse = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    const rootFolderId = folderResponse.data.id;


    await drive.permissions.create({
      fileId: rootFolderId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    await uploadFolderToDrive(drive, websiteDirectory, rootFolderId);


    await prisma.websites.update({
      where: {
        title: websiteDomain,
      },
      data: {
        type: "DRIVE",
        driveFolderId: rootFolderId,
      },
    });


    await fs.rm(websiteDirectory, { recursive: true });


    updateLoadingState(websiteDomain);

    console.log(`Upload de ${websiteDomain} concluído com sucesso.`);
  } catch (error) {
    console.error(
      `Erro ao fazer upload do site no Google Drive: ${error.message}`
    );
  }
}
