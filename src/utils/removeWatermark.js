import fs from "fs/promises";
import path from "path";

export const removeWatermark = async (siteDirectory) => {
  try {
    /* Obter todos os arquivos html do diretório fornecido */
    const files = await fs.readdir(siteDirectory);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    const watermarkStyle = /<style data-watermark>[\s\S]*?<\/style>/;

    for (const file of htmlFiles) {
      /* Ler o conteúdo do arquivo html */
      const filePath = path.join(siteDirectory, file);
      let data = await fs.readFile(filePath, "utf-8");

      /* Verificar se a marca da água existe */
      if (data.includes("data-watermark")) {
        const newContent = data.replace(watermarkStyle, "");
        await fs.writeFile(filePath, newContent, "utf-8");
      }
    }
  } catch (err) {
    console.error(`Erro ao remover marca d'água: ${err.message}`);
  }
};
