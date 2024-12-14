import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

import { normalizeCode, isCodeIncluded } from "./editorCodeFunctions.js";

export const removeEditabilityFromSite = async (siteDirectory) => {
  try {
    /* Obter todos os arquivos do diretório */
    const files = await fs.readdir(siteDirectory);
    const editorScriptsDir = path.join(siteDirectory, "editor-scripts");

    /* Obter todos os arquivos html do diretório */
    const htmlFiles = files.filter((file) => file.endsWith(".html"));
    const codeBody = `<script data-editor-element src="./editor-scripts/index.js" type="module"></script>`;

    for (const file of htmlFiles) {
      const filePath = path.join(siteDirectory, file);
      const tempFilePath = `${filePath}.tmp`;

      /* Ler o conteúdo do arquivo */
      let data = await fs.readFile(filePath, "utf-8");

      /* Se o código de edição estiver presente, remover */
      if (isCodeIncluded(data, [codeBody])) {
        let newContent = data
          .replace(normalizeCode(codeBody), "")
          .replace(/\n\s*\n/g, "\n");

        /* Escrever o novo conteúdo em um arquivo temporário */
        await fs.writeFile(tempFilePath, newContent, "utf-8");

        /* Mover o arquivo temporário para substituir o original */
        await fs.rename(tempFilePath, filePath);
      }
    }

    /* Remover o diretório 'editor-scripts' e seus arquivos */
    if (existsSync(editorScriptsDir)) {
      const editorFiles = await fs.readdir(editorScriptsDir);

      for (const file of editorFiles) {
        const filePath = path.join(editorScriptsDir, file);
        await fs.unlink(filePath); // Remover cada arquivo dentro do diretório
      }
      await fs.rmdir(editorScriptsDir);
    }
  } catch (err) {
    console.error(`Erro ao remover editabilidade: ${err.message}`);
  }
};
