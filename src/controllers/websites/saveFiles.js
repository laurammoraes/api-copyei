import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { z, ZodError } from "zod";

const adjustFileName = (fileName) => {
  if (fileName === "" || fileName === undefined) {
    return "index.html";
  }
  return fileName.endsWith(".html") ? fileName : `${fileName}.html`;
};

/* Define o esquema de validação para criação de domínio */
const saveFilesParams = z.object({
  siteDomain: z.string(),
});
const saveFilesBodySchema = z.object({
  htmlContent: z.string(),
});

/* Função para salvar arquivos dinamicamente */
export async function saveFiles(req, res) {
  try {
    /* Validar o corpo da requisição */
    const { siteDomain, fileName } = saveFilesParams.parse(req.params);
    const { htmlContent } = saveFilesBodySchema.parse(req.body);
    const adjustedFileName = adjustFileName(fileName);

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      siteDomain
    );

    /* Verificar se o diretório com esse nome existe, caso não exista, retornar mensagem */
    const filePath = path.join(siteDirectory, adjustedFileName);
    if (!existsSync(filePath))
      return res.status(400).json({ message: "Site não encontrado!" });

    /* Salva o conteúdo no arquivo especificado */
    await fs.writeFile(filePath, htmlContent, "utf-8");

    return res.status(200).json({ success: true });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao salvar o arquivo" });
  }
}
