import fs from "fs";
import path from "path";
import { z, ZodError } from "zod";

import { removeEditabilityFromSite } from "../../utils/removeEditabilityFromSite.js";
import { removeWatermark } from "../../utils/removeWatermark.js";

/* Define o esquema de validação para criação de domínio */
const downloadOnlyHtmlParams = z.object({
  siteDomain: z.string(),
});

export async function downloadOnlyHtml(req, res) {
  try {
    /* Validar o corpo da requisição */
    const { siteDomain } = downloadOnlyHtmlParams.parse(req.params);

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      siteDomain
    );

    /* Verificar se o diretório com esse nome existe, caso não exista, retornar mensagem */
    const indexPath = path.join(siteDirectory, "index.html");
    if (!fs.existsSync(indexPath))
      return res.status(400).json({ message: "Site não encontrado!" });

    let htmlContent = fs.readFileSync(indexPath, "utf-8");

    // TODO: Refactor Domain system
    /* Get server base URL for assets with /api/ */
    const serverBaseUrl = `${process.env.API_BASE_URL}/api/site/${siteDomain}`;

    /* Convert relative paths to absolute server paths for images, scripts, and stylesheets */
    htmlContent = htmlContent.replace(
      /(src|href)=["'](?!http|\/\/)([^"']+)["']/g,
      (match, attr, path) => {
        if (path.startsWith("data:")) return match;
        // Remove ./ or ../ from the beginning of the path
        const cleanPath = path.replace(/^[./]+/, "");
        return `${attr}="${serverBaseUrl}/${cleanPath}"`;
      }
    );

    /* Convert background images in inline styles and style tags */
    htmlContent = htmlContent.replace(
      /url\(['"]?(?!data:|http|\/\/)([^'")]+)['"]?\)/g,
      (match, path) => {
        const cleanPath = path.replace(/^[./]+/, "");
        return `url('${serverBaseUrl}/${cleanPath}')`;
      }
    );

    /* Remove watermark style if present */
    htmlContent = htmlContent.replace(
      /<style data-watermark>[\s\S]*?<\/style>/gi,
      ""
    );

    /* Remove editor-related elements and scripts */
    htmlContent = htmlContent.replace(
      /<script[^>]*editor[^>]*>[\s\S]*?<\/script>/gi,
      ""
    );
    htmlContent = htmlContent.replace(
      /<div[^>]*editor[^>]*>[\s\S]*?<\/div>/gi,
      ""
    );

    /* Remove non-editable classes */
    htmlContent = htmlContent.replace(/\s*class="[^"]*non-editable[^"]*"/g, "");

    /* Remover marca da água */
    await removeEditabilityFromSite(siteDirectory);
    await removeWatermark(siteDirectory);

    /* Retornar conteúdo html */
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename=index.html`);
    return res.status(200).send(htmlContent);
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao baixar o HTML" });
  }
}
