import Queue from "bull";

import { downloadWebsite } from "../services/downloadWebsite.js";

const cloneWebsitesQueue = new Queue("clone", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
    removeOnFail: false,
  },
});

cloneWebsitesQueue.on("failed", (job, err) => {
  console.error('Job ${ job.id } falhou após ${job.attemptsMade} tentativas: ${err.message}');
});


cloneWebsitesQueue.process(async (job) => {
  try {
    await downloadWebsite(
      job.data.siteId,
      job.data.url,
      job.data.domain,
      job.data.title
    );
  } catch (error) {
    console.error('Erro ao processar job: ${error.message}');
    throw error;
  }
});

export async function sendUrlToQueue(siteId, url, domain, title) {
  try {
    await cloneWebsitesQueue.add({ siteId, url, domain, title });
  } catch (error) {
    console.error('Erro ao adicionar job à fila: ${error.message}');
  }
}

