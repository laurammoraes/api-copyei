import { z, ZodError } from "zod";

import { prisma } from "../../lib/prisma.js";

/* Define o esquema de validação para criação de domínio */
const createDomainBodySchema = z.object({
  domain: z.string(),
});

/* Função para adicionar um domínio */
export async function createDomain(req, res) {
  try {
    /* Validar usuário */
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Não autorizado" });

    /* Verificar se o usuário é administrador */
    if (!user.role || user.role !== "ADMIN")
      return res.status(403).json({ message: "Não autorizado" });

    /* Validar o corpo da requisição */
    const { domain } = createDomainBodySchema.parse(req.body);

    /* Verificar se o domínio já existe, e se já existir, retornar mensagem ao usuário */
    const hasDomain = await prisma.domains.findUnique({
      where: {
        domain: domain,
      },
    });
    if (hasDomain)
      return res
        .status(400)
        .json({ message: "Este domínio já está cadastrado" });

    /* Cadastrar um novo domínio */
    await prisma.domains.create({
      data: {
        domain: domain,
        user_id: user.id,
      },
    });

    return res.status(200).json({ message: "Domínio criado com sucesso" });
  } catch (error) {
    /* Captação de erros do Zod */
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Data Parse Error",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao cadastrar domínio" });
  }
}
