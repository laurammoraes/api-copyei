import { oauth2Client } from "../lib/google-oauth.js";
import { prisma } from "../lib/prisma.js";

export async function getValidAccessToken(userId) {
  const userToken = await prisma.googleCredentials.findUnique({
    where: { user_id: userId },
  });

  if (!userToken) throw new Error("Usuário não encontrado");

  /* Comparar data de hoje */
  const today = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutos de margem
  if (new Date(userToken.expires_at).getTime() - bufferTime > today.getTime()) {
    return {
      access_token: userToken.access_token,
      refresh_token: userToken.refresh_token,
    };
  }


  /* Atualizar access_token se necessário */
  oauth2Client.setCredentials({ refresh_token: userToken.refresh_token });
  const { credentials } = await oauth2Client.refreshAccessToken();

  

  await prisma.googleCredentials.update({
    where: {
      user_id: userId,
    },
    data: {
      access_token: credentials.access_token,
      expires_at: new Date(credentials.expiry_date),
    },
  });

  return {
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
  };
}
