import { z, ZodError } from "zod";

import { prisma } from "../../lib/prisma.js";

const findWebSiteQuerySchema = z.object({
  type: z.enum(["LOCAL", "DRIVE"]).optional(),
});

export async function findWebSite(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    const { type } = findWebSiteQuerySchema.parse(req.query);

    /* Busca os sites clonados do usuário autenticado na base de dados */
    const sites = await prisma.websites.findMany({
      where: {
        user_id: user.id,
        type,
      },
      select: {
        id: true,
        clone_url: true,
        domain_id: true,
        title: true,
        status: true,
        type: true,
        Domain: {
          select: {
            id: true,
            domain: true,
          },
        },
      },
    });

    /* Obter domínios criados pelo usuário, mais o domínio padrão (copyei.online). copyei.com não é mais oferecido para novos clones. */
    const domains = await prisma.domains.findMany({
      where: {
        OR: [
          {
            user_id: user.id, // domínios criados pelo usuário
          },
          {
            domain: "copyei.online", // domínio padrão da plataforma
          },
        ],
      },
      select: {
        id: true,
        domain: true,
      },
    });

    /* URL para acessar cada site (usa title como identificador; domain é só hospedagem) */
    const sitesWithUrl = sites.map((site) => ({
      ...site,
      siteUrl: `${process.env.API_BASE_URL}/api/site/${site.title}`,
    }));

    return res.status(200).json({ sites: sitesWithUrl, domains });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao obter site" });
  }
}
