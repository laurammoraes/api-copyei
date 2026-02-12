import Queue from "bull";

import { uploadWebsiteToDrive } from "../services/uploadWebsiteToDrive.js";

const uploadToDriveQueue = new Queue("drive", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  },
  defaultJobOptions: {
    removeOnComplete: true, 
    // attempts: 3, 
    // timeout: 30000,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
    removeOnFail: false,  
  },
});

uploadToDriveQueue.on("failed", (job, err) => {
  
  console.error(`Job ${job.id} falhou após ${job.attemptsMade} tentativas: ${err.message}`);

  
});

uploadToDriveQueue.process(5, async (job) => {
  try {
    await uploadWebsiteToDrive(job.data.websiteDomain, job.data.decodedJWT);
  } catch (error) {
    console.error(`Erro ao processar job ${job.id}: ${error.message}`);
    throw error; 
  }
});

export async function uploadToDrive(websiteDomain, decodedJWT) {
  if (!websiteDomain || !decodedJWT) {
    throw new Error("Parâmetros inválidos: websiteDomain e decodedJWT são obrigatórios");
  }
   await uploadToDriveQueue.add({ websiteDomain, decodedJWT });

  
}

