import axios from "axios";
import https from "https";
import { z, ZodError } from "zod";

import { aaPanelSignature } from "../../utils/aaPanelSignature.js";

const aaPanelWebsitesCreateBodySchema = z.object({
  domain: z.string(),
  path: z.string(),
});

export async function aaPanelWebsitesCreate(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    console.log(user);
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Validar o corpo da requisição */
    const { domain, path } = aaPanelWebsitesCreateBodySchema.parse(req.body);

    /* aaPanel Ação */
    const url = `${process.env.AAPANEL_ENDPOINT}/site?action=AddSite`;

    /* Obter a chave necessária para a comunicação com o aaPanel */
    const pData = aaPanelSignature();

    /* Parâmetros necessários para a requisição */
    pData.webname = JSON.stringify({
      domain: domain,
      domainlist: [],
      count: 0,
    });
    pData.path = path;
    pData.ps = domain;
    pData.type = "PHP";
    pData.ftp = false;
    pData.sql = false;
    pData.port = 80;
    pData.type_id = 0;
    pData.version = "00";
    pData.set_ssl = 0;
    pData.force_ssl = 0;

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
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao cadastrar o site no aaPanel" });
  }
}
