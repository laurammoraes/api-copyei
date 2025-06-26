import fs from "fs/promises";
import path from "path";

const watermarkStyle = `
  <style data-watermark>
    body::after {
      content: '⚠️ Copyei - Versão de Demonstração ⚠️\\A 🚫 Este site é apenas para visualização.\\A 🚫 Não utilize para fins comerciais.';
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(255, 255, 255, 0.8);
      color: #333;
      padding: 15px 20px;
      border-radius: 6px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      z-index: 9999999;
      pointer-events: none;
      user-select: none;
      white-space: pre-wrap;
      text-align: right;
      font-size: 14px;
      line-height: 1.5;
    }
    
    body::after {
      display: block;
      white-space: pre;
    }

    /* Estilo para primeira linha (título) */
    body::after:first-line {
      font-size: 20px;
    }
    
    @media screen and (min-width: 768px) {
      body::after {
        font-size: 16px;
      }
      
      body::after:first-line {
        font-size: 24px;
      }
    }
  </style>
`;

export const addWatermark = async (siteDirectory) => {
  try {
    /* Obter todos os arquivos html do diretório fornecido */
    const files = await fs.readdir(siteDirectory);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    /* Para cada arquivo html, sobrescrever o conteúdo com uma marca da água */
    for (const file of htmlFiles) {
      /* Ler arquivo */
      const filePath = path.join(siteDirectory, file);
      let data = await fs.readFile(filePath, "utf-8");

      /* Verificar se a marca da água já existe */
      if (!data.includes("data-watermark")) {
        // const newContent = data.replace(
        //   "</head>",
        //   `${watermarkStyle}\n</head>`
        // );
        // await fs.writeFile(filePath, newContent, "utf-8");
      }
    }
  } catch (err) {
    console.error(`Erro ao adicionar marca d'água: ${err.message}`);
  }
};
