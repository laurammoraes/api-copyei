import fs from "fs/promises";
import path from "path";

import { copyFiles } from "./copyFiles.js";
import { removeWatermark } from "./removeWatermark.js";
import { isCodeIncluded } from "./editorCodeFunctions.js";

export const makeSiteEditable = async (siteDirectory) => {
  try {
    /* Obter todos os arquivos do diretório */
    const files = await fs.readdir(siteDirectory);

    /* Remover marca da água */
    await removeWatermark(siteDirectory);

    /* Obter caminho do diretório editor-scripts */
    const editorScripts = path.join(process.cwd(), "src", "editor-scripts");

    /* Copia os arquivos do diretório editor-scripts para dentro do site */
    await copyFiles(editorScripts, siteDirectory);

    /* Filtra arquivos que terminam com .html */
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    const codeBody = `<script data-editor-element src="./editor-scripts/index.js" type="module"></script>`;

    for (const file of htmlFiles) {
      /* Ler o conteúdo do arquivo */
      const filePath = path.join(siteDirectory, file);
      let data = await fs.readFile(filePath, "utf-8");

      /* Verificar se já existe o script do editor */
      if (isCodeIncluded(data, [codeBody])) continue;

      let newContent = data;

      /* Verificar se já existe o script do editor */
      if (!newContent.includes(codeBody)) {
        newContent = newContent.replace(/<\/body>/, `${codeBody}\n</body>`);
      }

      /* Sobrescrever o arquivo com o novo conteúdo */
      await fs.writeFile(filePath, newContent, "utf-8");
    }
  } catch (err) {
    console.error(`Erro: ${err.message}`);
  }
};
