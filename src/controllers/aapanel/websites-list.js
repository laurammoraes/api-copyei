import axios from "axios";
import https from "https";

import { aaPanelSignature } from "../../utils/aaPanelSignature.js";

export async function aaPanelWebsitesList(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* aaPanel Ação */
    const url = `${process.env.AAPANEL_ENDPOINT}/data?action=getData`;

    /* Obter a chave necessária para a comunicação com o aaPanel */
    const pData = aaPanelSignature();

    /* Parâmetros necessários para a requisição */
    pData.table = "sites";
    pData.limit = 15;

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    /* Enviar Requisição ao aaPanel */
    const response = await axios.post(url, new URLSearchParams(pData), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent,
    });

    return res.status(200).json({ data: response.data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao listar os sites do aaPanel" });
  }
}
