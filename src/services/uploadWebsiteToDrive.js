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

/* Função para aguardar um intervalo de tempo */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Função para criar arquivo no Drive e torná-lo público */
async function createPublicFile(drive, fileMetadata, media) {
  try {
    const fileResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    /* Aguarda 1 segundo antes de aplicar permissões para evitar erros */
    await sleep(1000);

    /* Tornar o arquivo público */
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
  /* Ler conteúdo do diretório */
  const entries = await fs.readdir(localPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(localPath, entry.name);

    /* Fazer distinção entre arquivo e pasta */
    if (entry.isDirectory()) {
      /* Se for uma pasta, criar sua equivalência no Google Drive */
      const folderMetadata = {
        name: entry.name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [driveParentId],
      };

      /* Criar pasta no Google Drive */
      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      const folderId = folderResponse.data.id;

      /* Recursividade para enviar os arquivos dos subdiretórios */
      await uploadFolderToDrive(drive, entryPath, folderId);
    } else if (entry.isFile()) {
      /* Definir metadados do arquivo */
      const fileMetadata = {
        name: entry.name,
        parents: [driveParentId],
      };
      const media = {
        mimeType: mime.lookup(entryPath) || "application/octet-stream",
        body: createReadStream(entryPath),
      };

      await createPublicFile(drive, fileMetadata, media);
      // /* Criar arquivo no Google Drive */
      // const fileResponse = await drive.files.create({
      //   requestBody: fileMetadata,
      //   media: media,
      //   fields: "id, webViewLink, webContentLink",
      // });

      // /* Tornar o arquivo público */
      // await drive.permissions.create({
      //   fileId: fileResponse.data.id,
      //   requestBody: {
      //     role: "reader",
      //     type: "anyone",
      //   },
      // });
    }
  }
}

export async function uploadWebsiteToDrive(websiteDomain, decodedJWT) {
  /* Definir o caminho do arquivo para fazer upload */
  const websiteDirectory = path.join(
    process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
    websiteDomain
  );

  /* Verificar se o diretório existe */
  if (!existsSync(websiteDirectory)) {
    throw new Error("Arquivo local não encontrado");
  }

  /* Remover marca da água */
  await removeWatermark(websiteDirectory);

  /* Remover editor, caso presente */
  await removeEditabilityFromSite(websiteDirectory);

  /* Obter credenciais do Google Drive */
  oauth2Client.setCredentials(decodedJWT);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const folderMetadata = {
      name: `www.copyei-${websiteDomain}`,
      mimeType: "application/vnd.google-apps.folder",
    };

    /* Criar uma pasta dentro go google drive */
    const folderResponse = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    const rootFolderId = folderResponse.data.id;

    /* Tornar a pasta pública */
    await drive.permissions.create({
      fileId: rootFolderId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    await uploadFolderToDrive(drive, websiteDirectory, rootFolderId);

    /* Atualizar site */
    await prisma.websites.update({
      where: {
        title: websiteDomain,
      },
      data: {
        type: "DRIVE",
        driveFolderId: rootFolderId,
      },
    });

    /* Delete pasta local */
    await fs.rm(websiteDirectory, { recursive: true });

    /* Atualizar estado do websocket */
    updateLoadingState(websiteDomain);

    console.log(`Upload de ${websiteDomain} concluído com sucesso.`);
  } catch (error) {
    console.error(
      `Erro ao fazer upload do site no Google Drive: ${error.message}`
    );
  }
}
