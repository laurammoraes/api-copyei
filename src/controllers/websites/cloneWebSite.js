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
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    const { url, domainId, title } = cloneBodySchema.parse(req.body);
    console.log("[cloneWebSite] Início da clonagem:", { userId: user.id, url, title, domainId });

    const totalWebsites = await prisma.websites.count({
      where: {
        user_id: user.id,
        type: "LOCAL",
      },
    });
    if (totalWebsites >= 2)
      return res.status(422).json({
        message:
          "Você chegou no limite de clones dos sites. Para continuar, exclua um de seus sites clonados.",
      });

    const isValidUrl = await validateUrl(url);

    if (!isValidUrl) {
      console.log("[cloneWebSite] URL inválida ou inacessível:", url);
      return res.status(200).json({ message: "URL não encontrada" });
    }

   
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
    });

    if (!userData)
      return res.status(200).json({ message: "Usuário não encontrado" });

   
    const thisDomain = await prisma.domains.findUnique({
      where: { id: domainId },
    });

    if (!thisDomain)
      return res.status(200).json({ message: "Domínio não encontrado" });

    
    //TO-DO: REVER ESSA VALIDAÇÃO E A MENSAGEM DE ERRO AO USUÁRIO
    const website = await prisma.websites.findFirst({
      where: { title },
    });
    if (website) return res.status(200).json({ message: "Site já existente" });

  
    const siteDirectory = path.join(
      process.env.COPYEI_WEBSITES_OUTPUT_DIRECTORY,
      title
    );

    
    if (fs.existsSync(siteDirectory))
      return res.status(200).json({ message: "Site já existente" });

   
    const data = await prisma.websites.create({
      data: {
        user_id: user.id,
        clone_url: url,
        domain_id: domainId,
        title,
        status: "CLONING",
      },
    });
    console.log("[cloneWebSite] Site criado no banco, id:", data.id);

    await sendUrlToQueue(data.id, url, thisDomain.domain, title);
    console.log("[cloneWebSite] Job enviado para a fila de clonagem, siteId:", data.id);

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("[cloneWebSite] Erro no processo de clonagem:", error.message, error.stack);
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    
    return res.status(500).json({
      error:
        "Ocorreu um erro ao clonar o site informado.",
    });
  }
}
