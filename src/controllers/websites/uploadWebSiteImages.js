import path from "path";

export async function uploadWebSiteImages(req, res) {
  /* Verificar se o middleware Multer conseguiu processar a imagem */
  if (!req.body.siteDomain || !req.file) {
    return res
      .status(400)
      .json({ error: "Faltando o domínio do site ou arquivo de imagem." });
  }

  res.json({
    message: "Upload realizado com sucesso!",
    imagePath: path.join("/images", req.body.image), // Retorna o caminho correto da imagem
  });
}
