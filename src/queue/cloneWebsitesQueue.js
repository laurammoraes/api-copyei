import Queue from "bull";
import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { downloadWebsite } from "../services/downloadWebsite.js";
import { deleteWebsiteRecord } from "../services/database.js";

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

cloneWebsitesQueue.process(async (job) => {
  try {
    const websitePath = path.join("/var/www/copyei_websites", job.data.title);
    await downloadWebsite(job.data.siteId, job.data.url, job.data.domain, job.data.title);

    // Validação pós-clonagem
    const indexPath = path.join(websitePath, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error("Erro: index.html não encontrado");
      await deleteWebsiteRecord(job.data.siteId);
      throw new Error("index.html não foi clonado corretamente");
    }

    // Analisar o HTML
    const htmlContent = fs.readFileSync(indexPath, "utf8");
    const $ = cheerio.load(htmlContent);

    let missingFiles = [];

    // Verificar arquivos CSS
    $("link[rel='stylesheet']").each((_, element) => {
      const cssFile = $(element).attr("href");
      if (cssFile && !fs.existsSync(path.join(websitePath, cssFile))) {
        missingFiles.push(cssFile);
      }
    });

    // Verificar imagens
    $("img").each((_, element) => {
      const imgFile = $(element).attr("src");
      if (imgFile && !fs.existsSync(path.join(websitePath, imgFile))) {
        missingFiles.push(imgFile);
      }
    });

    if (missingFiles.length > 0) {
      console.error("Erro: arquivos faltando", missingFiles);
      await deleteWebsiteRecord(job.data.siteId);
      throw new Error("Arquivos necessários não foram clonados corretamente");
    }

    console.log("Clonagem validada com sucesso");
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
