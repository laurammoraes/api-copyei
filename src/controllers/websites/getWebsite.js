import { z, ZodError } from "zod";

import { prisma } from "../../lib/prisma.js";

const getWebsiteByIdParams = z.object({
  id: z.coerce.number(),
});

export async function getWebsiteById(req, res) {
  try {
    /* Validar o corpo da requisição */
    const { id } = getWebsiteByIdParams.parse(request.params);

    /* Verificar se o site existe, e se não existir, retornar mensagem ao usuário */
    const site = await prisma.websites.findUnique({
      where: { id },
    });
    if (!site) return res.status(400).json({ message: "Site não encontrado!" });

    return res.status(200).json(site);
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar site" });
  }
}
