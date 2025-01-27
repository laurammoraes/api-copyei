import fs from "fs";
import path from "path";

import { prisma } from "../lib/prisma.js";
import { removeEditabilityFromSite } from "../utils/removeEditabilityFromSite.js";

export async function domainsHandler(req, res, next) {
  /* Get host and path from header */
  const host = req.headers.host.split(":")[0];
  const path = req.originalUrl;
  const pathArr = path.split("/");
  const lastPath = pathArr[pathArr.length - 1];
  console.log("host", host);
  console.log("path", lastPath);

  /* Ignore API endpoints */
  if (host === "api.copyei.com") return next();

  /* sites.copyei.com redirects */
  if (host === "sites.copyei.com") return next();

  /* Customers Domains */
  const domain = await prisma.domains.findUnique({
    where: {
      domain: host,
    },
    select: {
      id: true,
    },
  });
  if (!domain) return next();

  const website = await prisma.websites.findUnique({
    where: {
      domain_id: domain.id,
      title: lastPath,
    },
  });
  if (!website) return next();

  /* Definir caminho relativo */
  const siteDirectory = path.join(
    process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
    website.title
  );

  /* Verificar se o diretório com esse nome existe, caso não exista, retornar mensagem */
  if (!fs.existsSync(siteDirectory)) return next();

  await removeEditabilityFromSite(siteDirectory);

  /* Prover site estático */
  const serveStatic = express.static(siteDirectory);
  return serveStatic(req, res, next);

  // if (host === "donminus.com.br") return express.static("/artur");
  // if (host === "localhost") {
  //   const serveStatic = express.static(
  //     `${process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY}/violao`
  //   );
  //   return serveStatic(req, res, next);
  // }

  next();
}
