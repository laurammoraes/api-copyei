import express from "express";
import path from "path";
import fs from "fs";
import { z, ZodError } from "zod";

import { removeEditabilityFromSite } from "../utils/removeEditabilityFromSite.js";
import { addWatermark } from "../utils/addWatermark.js";
import { removeWatermark } from "../utils/removeWatermark.js";

const provideStaticSiteEditorParams = z.object({
  siteDomain: z.string(),
});

export async function provideStaticSite(req, res, next) {
  try {
    /* Validar o corpo da requisição */
    const { siteDomain } = provideStaticSiteEditorParams.parse(req.params);

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      siteDomain
    );

    /* Verificar se o diretório com esse nome existe, caso não exista, retornar mensagem */
    if (!fs.existsSync(siteDirectory))
      return res.status(404).json({ message: "Site não encontrado" });

    await removeEditabilityFromSite(siteDirectory);

    /* Adicionar ou remover marca da água */
    const isEditor = req.path.includes("/editor/");
    if (!isEditor) {
      await addWatermark(siteDirectory);
    } else {
      await removeWatermark(siteDirectory);
    }

    /* Prover site estático */
    const serveStatic = express.static(siteDirectory);
    return serveStatic(req, res, next);
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar site" });
  }
}
