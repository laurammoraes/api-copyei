import scrape from "website-scraper";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";

import { prisma } from "../lib/prisma.js";


dotenv.config();

export async function downloadWebsite(siteId, url, domain, title) {
  const siteDirectory = path.join(
    process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
    title
  );
  console.log("[downloadWebsite] Início:", { siteId, url, title, siteDirectory });

  try {
    await scrape({
      urls: [url], // URL do site a ser baixado
      directory: siteDirectory,
      sources: [
        { selector: "img", attr: "src" },
        { selector: 'link[rel="stylesheet"]', attr: "href" },
        { selector: "script", attr: "src" },
      ],
      recursive: true,
      maxDepth: 3,
      urlFilter: (link) => {
        return link.startsWith(url) || link.startsWith(`${url}/`);
      },
      // filenameGenerator: 'bySiteStructure',
      // prettifyUrls: true,
    });
    console.log("[downloadWebsite] Scrape concluído para siteId:", siteId);

    // TODO: Refactor Domain system
    // if (process.env.NODE_ENV === "production") {
    //   await axios.post(`${process.env.API_BASE_URL}/aapanel/websites/create`, {
    //     domain: domain,
    //     path: `/www/wwwroot/${domain}`,
    //   });
    // }

    console.log("[downloadWebsite] Atualizando status para ACTIVE, siteId:", siteId);
    await prisma.websites.update({
      where: {
        id: siteId,
      },
      data: {
        status: "ACTIVE",
      },
    });
    console.log("[downloadWebsite] Clonagem finalizada com sucesso, siteId:", siteId);

    if (process.env.NODE_ENV === "development")
      console.info(
        `Download completo! A página foi salva no diretório: ${process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY}/${title}`
      );
  } catch (error) {
    console.error(
      "[downloadWebsite] Erro ao fazer o download:",
      error.message,
      "siteId:",
      siteId,
      "url:",
      url,
      error.stack
    );
    throw error;
  }
}
