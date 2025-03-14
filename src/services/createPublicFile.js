

import { oauth2Client } from "../lib/google-oauth.js";


export async function createPublicFile(drive, fileMetadata, media) {
    // try {
      if (oauth2Client.isTokenExpiring()) {
        console.log("🔄 Renovando token...");
        await oauth2Client.refreshAccessToken();
      }
  
      const fileResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
      });
  
      console.log('File response ____------------')
      console.log(fileResponse )
      console.log('File response ____------------')
  
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
    // } catch (error) {
    //   console.error(`❌ Erro ao criar o arquivo ${fileMetadata.name}: ${error.message}`);
    //   throw new Error(`Erro ao criar o arquivo ${fileMetadata.name}: ${error.message}`);
    // }
  }
  