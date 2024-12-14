import Queue from "bull";

import { downloadWebsite } from "../services/downloadWebsite.js";

const cloneWebsitesQueue = new Queue("clone", {
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
cloneWebsitesQueue.on("error", () => {
  throw new Error("Não foi possível estabelecer conexão com o banco de dados");
});

cloneWebsitesQueue.process(async (job, done) => {
  await downloadWebsite(
    job.data.siteId,
    job.data.url,
    job.data.domain,
    job.data.title
  );

  done();
});

export async function sendUrlToQueue(siteId, url, domain, title) {
  await cloneWebsitesQueue.add({ siteId, url, domain, title });
}
