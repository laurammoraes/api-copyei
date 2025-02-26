import Queue from "bull";

import { uploadWebsiteToDrive } from "../services/uploadWebsiteToDrive.js";

const uploadToDriveQueue = new Queue("drive", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: true, // Remove on complete
  },
});

/* Catch Redis Connection Error */
uploadToDriveQueue.on("error", () => {
  throw new Error("Não foi possível estabelecer conexão com o banco de dados");
});

uploadToDriveQueue.process(async (job, done) => {
  await uploadWebsiteToDrive(job.data.websiteDomain, job.data.decodedJWT);

  done();
});

export async function uploadToDrive(websiteDomain, decodedJWT) {
  await uploadToDriveQueue.add({ websiteDomain, decodedJWT });
}