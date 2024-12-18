import { z, ZodError } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma.js";

const registerBodySchema = z.object({
  name: z.string().max(255),
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(72)
    .regex(/^(?=.*[a-zA-Z])/, "The password must have a letter")
    .regex(/^(?=.*\d)/, "The password must have a number")
    .regex(/^(?=.*[@.#$!%*?&^])/, "The password must have special character"),
  repeatPassword: z.string().min(6).max(72),
});

export async function registerUser(req, res) {
  try {
    /* Validar o corpo da requisição */
    const { name, email, password, repeatPassword } = registerBodySchema.parse(
      req.body
    );

    /* Verificar se as senha coincidem */
    if (password !== repeatPassword)
      return res.status(400).json({ message: "Passwords Do Not Match" });

    /* Verificar se o email existe, se existir, retornar mensagem ao usuário */
    const duplicatedEmail = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (duplicatedEmail)
      return res.status(400).json({ message: "Email Already Exists" });

    /* Gerar Hash da senha */
    const hash = await bcrypt.hash(password, 12);

    /* Cadastrar Usuário */
    await prisma.users.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    return res.status(201).json({ message: "CREATED" });
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
      error: "Ocorreu um erro inesperado. Tente novamente mais tarde...",
    });
  }
}
