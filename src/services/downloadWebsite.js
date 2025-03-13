import scrape from "website-scraper";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";

import { prisma } from "../lib/prisma.js";


dotenv.config();

export async function downloadWebsite(siteId, url, domain, title) {
  try {

    if (typeof siteId !== "string") siteId = String(siteId);
    if (typeof url !== "string") url = String(url);
    if (typeof domain !== "string") domain = String(domain);
    if (typeof title !== "string") title = String(title);

    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      title
    );

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

    // TODO: Refactor Domain system
    // if (process.env.NODE_ENV === "production") {
    //   await axios.post(`${process.env.API_BASE_URL}/aapanel/websites/create`, {
    //     domain: domain,
    //     path: `/www/wwwroot/${domain}`,
    //   });
    // }

    // Atualizar o status do site para 'ACTIVE'
    await prisma.websites.update({
      where: {
        id: siteId,
      },
      data: {
        status: "ACTIVE",
      },
    });

    if (process.env.NODE_ENV === "development")
      console.info(
        `Download completo! A página foi salva no diretório: ${process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY}/${title}`
      );
  } catch (error) {
    console.error(`Erro ao fazer o download: ${error.message}`);
  }
}
