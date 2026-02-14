import Queue from "bull";

import { downloadWebsite } from "../services/downloadWebsite.js";

const cloneWebsitesQueue = new Queue("clone", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
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
  console.error(
    `[cloneQueue] Job ${job.id} falhou após ${job.attemptsMade} tentativas:`,
    err.message,
    err.stack
  );
});

cloneWebsitesQueue.process(async (job) => {
  console.log("[cloneQueue] Processando job:", job.id, "data:", job.data);
  try {
    await downloadWebsite(
      job.data.siteId,
      job.data.url,
      job.data.domain,
      job.data.title
    );
    console.log("[cloneQueue] Job concluído com sucesso:", job.id, "siteId:", job.data.siteId);
  } catch (error) {
    console.error("[cloneQueue] Erro ao processar job:", job.id, error.message, error.stack);
    throw error;
  }
});

export async function sendUrlToQueue(siteId, url, domain, title) {
  try {
    const job = await cloneWebsitesQueue.add({ siteId, url, domain, title });
    console.log("[cloneQueue] Job adicionado à fila:", job.id, "siteId:", siteId, "title:", title);
  } catch (error) {
    console.error(error, "Erro na FILA DE CLONAGEM");
    console.error(`Erro ao adicionar job à fila: ${error.message}`);
  }
}

