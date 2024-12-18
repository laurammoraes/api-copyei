import express from "express";
import fs from "fs";
import path from "path";
import { z, ZodError } from "zod";

import { prisma } from "../lib/prisma.js";
import { makeSiteEditable } from "../utils/makeSiteEditable.js";

const provideStaticEditorParams = z.object({
  siteDomain: z.string(),
});

export async function provideStaticEditor(req, res, next) {
  try {
    /* Validar o corpo da requisição */
    const { siteDomain } = provideStaticEditorParams.parse(req.params);

    /* Obter usuário */
    const { user } = req;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Obter website no banco de dados, e verificar se o usuário é o dono da página, caso não seja, redirecionar */
    const website = await prisma.websites.findUnique({
      where: {
        title: siteDomain,
      },
    });
    if (!website) return res.status(404).json({ message: "Não encontrado" });
    if (website.user_id !== user.id)
      return res.status(403).json({ message: "Não autorizado" });

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      siteDomain
    );

    /* Verificar se o diretório com esse nome existe, caso não exista, retornar mensagem */
    if (!fs.existsSync(siteDirectory))
      return res.status(404).json({ message: "Não encontrado" });

    /* Habilitar editor */
    await makeSiteEditable(siteDirectory);

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
