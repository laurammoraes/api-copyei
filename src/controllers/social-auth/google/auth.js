import { oauth2Client } from "../../../lib/google-oauth.js";

export async function googleAuth(req, res) {
  /* Gerar link de autenticação social */
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent",
  });

  return res.redirect(authUrl);
}
