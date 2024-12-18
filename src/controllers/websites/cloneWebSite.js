import fs from "fs";
import path from "path";
import { z, ZodError } from "zod";

import { prisma } from "../../lib/prisma.js";
import { sendUrlToQueue } from "../../queue/cloneWebsitesQueue.js";
import { validateUrl } from "../../utils/validateUrl.js";

const cloneBodySchema = z.object({
  title: z.string().regex(/^[a-zA-Z0-9]+$/),
  url: z.string(),
  domainId: z.coerce.number(),
});

export async function cloneWebSite(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Validar o corpo da requisição */
    const { url, domainId, title } = cloneBodySchema.parse(req.body);

    /* Verificar se URL é valido */
    const isValidUrl = await validateUrl(url);
    if (!isValidUrl)
      return res.status(400).json({ message: "URL não encontrada" });

    /* Verificar se o usuário existe */
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
    });
    if (!userData)
      return res.status(400).json({ message: "Usuário não encontrado" });

    /* Verificar se o domínio existe, caso não exista, retornar mensagem */
    const thisDomain = await prisma.domains.findUnique({
      where: { id: domainId },
    });
    if (!thisDomain)
      return res.status(400).json({ message: "Domínio não encontrado" });

    /* Verificar se o site existe, caso exista, retornar mensagem */
    const website = await prisma.websites.findFirst({
      where: { title },
    });
    if (website) return res.status(400).json({ message: "Site já existente" });

    /* Definir caminho relativo */
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      title
    );

    /* Verificar se o diretório com esse nome existe, caso exista, retornar mensagem */
    if (fs.existsSync(siteDirectory))
      return res.status(400).json({ message: "Site já existente" });

    /* Obter número de sites clonados pelo usuário, e se for superior a 2, retornar mensagem */
    const totalWebsites = await prisma.websites.count({
      where: {
        user_id: user.id,
      },
    });
    if (totalWebsites >= 2)
      return res.status(422).json({
        message:
          "Você chegou no limite de clones dos sites. Para continuar, exclua um de seus sites clonados.",
      });

    /* Cadastrar site */
    const data = await prisma.websites.create({
      data: {
        user_id: user.id,
        clone_url: url,
        domain_id: domainId,
        title,
        status: "CLONING",
      },
    });

    /* Enviar para fila de clonagem */
    await sendUrlToQueue(data.id, url, thisDomain.domain, title);

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({
      error:
        "Ocorreu um erro ao clonar o site informado. Tente novamente mais tarde...",
    });
  }
}
