import axios from "axios";

/* Fazer um fetch para a url, a fim de validar se ela existe */
export async function validateUrl(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}
