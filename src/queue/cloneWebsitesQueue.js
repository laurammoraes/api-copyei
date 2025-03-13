import Queue from "bull";
import { downloadWebsite } from "../services/downloadWebsite.js";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";


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
  console.error(`Job ${job.id} falhou após ${job.attemptsMade} tentativas: ${err.message}`);
});

async function validateClone(siteId) {
  const clonePath = path.join("clones", siteId);
  const indexPath = path.join(clonePath, "index.html");

  
  if (!fs.existsSync(indexPath)) {
    throw new Error("Erro: index.html não foi clonado corretamente.");
  }

  
  const htmlContent = fs.readFileSync(indexPath, "utf-8");
  const $ = cheerio.load(htmlContent);
  const missingFiles = [];

  
  $("img").each((_, img) => {
    const src = $(img).attr("src");
    if (src && !fs.existsSync(path.join(clonePath, src))) {
      missingFiles.push(src);
    }
  });

  
  $("link[rel='stylesheet']").each((_, link) => {
    const href = $(link).attr("href");
    if (href && !fs.existsSync(path.join(clonePath, href))) {
      missingFiles.push(href);
    }
  });

  
  if (missingFiles.length > 0) {
    throw new Error(`Erro: Os seguintes arquivos estão ausentes na clonagem: ${missingFiles.join(", ")}`);
  }

  console.log(`Clonagem validada para site ${siteId}`);
}

cloneWebsitesQueue.process(async (job) => {
  try {
    await downloadWebsite(job.data.siteId, job.data.url, job.data.domain, job.data.title);
    await validateClone(job.data.siteId); 
  } catch (error) {
    console.error(`Erro ao processar job: ${error.message}`);
    throw error;
  }
});

export async function sendUrlToQueue(siteId, url, domain, title) {
  try {
    await cloneWebsitesQueue.add({ siteId, url, domain, title });
  } catch (error) {
    console.error(`Erro ao adicionar job à fila: ${error.message}`);
  }
}
