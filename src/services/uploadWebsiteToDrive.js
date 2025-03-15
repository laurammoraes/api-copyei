import { google } from "googleapis";
import { existsSync, createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

import { oauth2Client } from "../lib/google-oauth.js";
import { prisma } from "../lib/prisma.js";
import { removeWatermark } from "../utils/removeWatermark.js";
import { removeEditabilityFromSite } from "../utils/removeEditabilityFromSite.js";
import { updateLoadingState, emitUploadError } from "./websocket.js";



function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createPublicFile(drive, fileMetadata, media) {
  try {
    if (oauth2Client.isTokenExpiring()) {
      console.log("🔄 Renovando token...");
      await oauth2Client.refreshAccessToken();
    }

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

    console.log(`✅ Arquivo ${fileMetadata.name} enviado e tornado público.`);
    return fileResponse;
  } catch (error) {
    console.error(`❌ Erro ao criar o arquivo ${fileMetadata.name}: ${error.message}`);
    await emitUploadError(websiteDomain, error.message);
    throw new Error(`Erro ao criar o arquivo ${fileMetadata.name}: ${error.message}`);

  }
}

async function uploadFolderToDrive(drive, localPath, driveParentId, batchSize = 5) {
  const entries = await fs.readdir(localPath, { withFileTypes: true });

  const folders = [];
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(localPath, entry.name);
    if (entry.isDirectory()) {
      folders.push({ name: entry.name, path: entryPath });
    } else if (entry.isFile()) {
      files.push({ name: entry.name, path: entryPath });
    }
  }

  const folderIds = {};
  for (const folder of folders) {
    const folderMetadata = {
      name: folder.name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [driveParentId],
    };

    try {
      if (oauth2Client.isTokenExpiring()) {
        console.log("🔄 Renovando token antes de criar a pasta...");
        await oauth2Client.refreshAccessToken();
      }

      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      console.log('Folder Response' )
      console.dir()

      folderIds[folder.name] = folderResponse.data.id;
      await uploadFolderToDrive(drive, folder.path, folderResponse.data.id, batchSize);
    } catch (error) {
      console.error(`❌ Erro ao criar pasta ${folder.name}: ${error.message}`);
      await emitUploadError(websiteDomain, error.message);
      throw new Error(`Erro ao criar pasta ${folder.name}: ${error.message}`);
    }
  }

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);


    try {
      await Promise.all(
        batch.map(async (file) => {
          const fileMetadata = {
            name: file.name,
            parents: [driveParentId],
          };
          const media = {
            mimeType: mime.lookup(file.path) || "application/octet-stream",
            body: createReadStream(file.path),
          };

          await createPublicFile(drive, fileMetadata, media);
        })
      );

      console.log(`✅ Lote de ${batch.length} arquivos enviado.`);
    } catch (error) {
      console.error(`❌ Erro no upload do lote de arquivos: ${error.message}`);
      await emitUploadError(websiteDomain, error.message);
      throw new Error(`Erro no upload do lote de arquivos: ${error.message}`);
    }

  }
}


export async function uploadWebsiteToDrive(websiteDomain, decodedJWT) {
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

    await updateLoadingState(websiteDomain);

    console.log(`✅ Upload de ${websiteDomain} concluído com sucesso.`);
    return "Upload concluído com sucesso";
  } catch (error) {

    console.error(`❌ Erro ao fazer upload do site no Google Drive: ${error.message}`);
    await emitUploadError(websiteDomain, error.message);
    throw new Error(`Erro ao fazer upload do site no Google Drive: ${error.message}`);

  }
}
