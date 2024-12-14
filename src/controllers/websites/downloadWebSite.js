import path from "path";
import fs from "fs";
import archiver from "archiver";
import { z, ZodError } from "zod";

import { removeEditabilityFromSite } from "../../utils/removeEditabilityFromSite.js";
import { removeWatermark } from "../../utils/removeWatermark.js";

/* Define o esquema de validação para criação de domínio */
const downloadWebSiteParams = z.object({
  siteDomain: z.string(),
});

export async function downloadWebSite(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Validar o corpo da requisição */
    const { siteDomain } = downloadWebSiteParams.parse(req.params);

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      siteDomain
    );

    /* Verificar se o diretório com esse nome existe, caso não exista, retornar mensagem */
    if (!fs.existsSync(siteDirectory))
      return res.status(400).json({ message: "Site não encontrado!" });

    /* Remover marca da água */
    await removeWatermark(siteDirectory);
    await removeEditabilityFromSite(siteDirectory);

    /* Transforma o site em um arquivo zip e envia para o cliente */
    const zipFileName = `${siteDomain}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);

    /* Compactar arquivos */
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
    archive.on("error", (err) => {
      throw err;
    });
    archive.pipe(res);
    archive.directory(siteDirectory, false);
    await archive.finalize();

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao baixar o site!" });
  }
}
