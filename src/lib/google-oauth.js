import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.API_BASE_URL}/google/callback`;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export async  function validateOauthToken(access_token){
  try {
    await oauth2Client.getTokenInfo(access_token)
    return true
  } catch(e){

    return false
  }
}

export async function refreshOauthToken(access_token, refresh_token){
  try {
    oauth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token
    })
  
    const { credentials } = await oauth2Client.refreshAccessToken();  

    return credentials
  } catch (e){
    throw new Error(e)
  }

}