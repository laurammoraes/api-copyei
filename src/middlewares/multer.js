import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

/* Configurar caminho do diretório atual */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware para upload de imagens */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    /* Validar o corpo da requisição */
    const siteDomain = req.body.siteDomain;
    if (!siteDomain) return cb(new Error("Dados Inválidos"), false);

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      siteDomain
    );

    /* Verificar se o diretório existe, caso não exista, retornar mensagem */
    if (!fs.existsSync(siteDirectory))
      return cb(new Error("Diretório não encontrado"), false);

    /* Verificar se o diretório existe, caso não exista, retornar mensagem */
    if (!fs.existsSync(`${siteDirectory}/images`)) {
      fs.mkdirSync(`${siteDirectory}/images`);
    }

    cb(null, `${siteDirectory}/images`);
  },

  filename: (req, file, cb) => {
    /* Gerar um nome aleatório para a imagem */
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      "uploads" +
      file.fieldname +
      "-" +
      uniqueSuffix +
      path.extname(file.originalname);

    /* Verificar formato da imagem */
    if (file.mimetype.split("/")[0] !== "image")
      return cb(new Error("Formato de imagem inválido"), false);

    cb(null, filename);

    /* Armazena o nome do arquivo na requisição para ser usado posteriormente */
    req.body.image = filename;
  },
});

export const upload = multer({ storage: storage });
