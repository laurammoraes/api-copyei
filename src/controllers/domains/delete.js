import { z, ZodError } from "zod";

import { prisma } from "../../lib/prisma.js";

/* Esquema para validar a requisição */
const deleteDomainBodySchema = z.object({
  domain: z.string(),
});

export async function deleteDomain(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Verificar se o usuário é administrador */
    if (!user.role || user.role !== "ADMIN")
      return res.status(403).json({ message: "Não autorizado" });

    /* Validar o corpo da requisição */
    const { domain } = deleteDomainBodySchema.parse(req.body);

    /* Verificar se o domínio existe, e se não existir, retornar mensagem ao usuário */
    const hasDomain = await prisma.domains.findUnique({
      where: {
        domain: domain,
      },
      select: {
        user_id: true,
      },
    });
    if (!hasDomain)
      return res.status(400).json({ message: "Domínio não existente" });

    /* Verificar se o usuário que está deletando é o mesmo que cadastrou o domínio */
    if (user.id !== hasDomain.user_id)
      return res.status(403).json({ message: "Não autorizado" });

    /* Deletar domínio */
    await prisma.domains.delete({
      where: {
        domain: domain,
      },
    });

    res.status(200).json({ message: "Domínio deletado com sucesso" });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar domínio" });
  }
}
