import fs from "fs/promises";
import path from "path";

export async function copyFiles(sourceDir, destinationDir) {
  try {
    const sourceDirName = path.basename(sourceDir);
    const newDestinationDir = path.join(destinationDir, sourceDirName);

    /* Verifica se o diretório de origem existe */
    try {
      await fs.access(sourceDir);
    } catch (err) {
      throw new Error(`Diretório de origem não encontrado: ${sourceDir}`);
    }

    /* Verifica se o diretório de destino existe, senão cria */
    await fs.mkdir(newDestinationDir, { recursive: true });

    /* Lê os arquivos no diretório de origem */
    const files = await fs.readdir(sourceDir);

    for (const file of files) {
      const sourceFile = path.join(sourceDir, file);
      const destinationFile = path.join(newDestinationDir, file);

      /* Copia cada arquivo */
      await fs.copyFile(sourceFile, destinationFile);
    }
  } catch (error) {
    console.error("Erro ao copiar arquivos:", error);
  }
}
