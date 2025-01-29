import jwt from "jsonwebtoken";

import { oauth2Client } from "../../../lib/google-oauth.js";
import { prisma } from "../../../lib/prisma.js";

export async function googleCallback(req, res) {
  /* Obter código do Google */
  const code = req.query.code;
  if (!code) return res.status(400).json({ message: "Código incorreto" });

  /* Obter token de autenticação da Copyei */
  const { copyei_user } = req.cookies;
  if (!copyei_user)
    return res.status(401).json({ message: "Usuário não autenticado" });

  /* Validar JWT token */
  const decoded = jwt.verify(copyei_user, process.env.JWT_SECRET);
  if (!decoded || !decoded.id)
    return res.status(401).json({ message: "Not Authorized" });

  try {
    /* Obter token de autenticação do Google OAuth */
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    await prisma.googleCredentials.upsert({
      where: {
        user_id: decoded.id,
      },
      create: {
        user_id: decoded.id,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: new Date(tokens.expiry_date),
      },
      update: {
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: new Date(tokens.expiry_date),
      },
    });

    /* Gerar token JWT */
    const jwtToken = jwt.sign(tokens, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    /* Adicionar cookie com o jwt do Google Drive */
    res.cookie("copyei_drive", jwtToken, {
      expiresIn: "1d",
    });

    /* Redirecionar usuário ao frontend */
    const redirectUrl = process.env.APP_BASE_URL;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Ocorreu um erro ao lidar com a autenticação do Google.",
    });
  }
}
