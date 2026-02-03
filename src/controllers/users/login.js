import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../../lib/prisma.js";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function loginUser(req, res) {
  try {
    /* Validar o corpo da requisição */
    const { email, password } = loginBodySchema.parse(req.body);

    /* Obter usuário, e se não existir, retornar mensagem ao usuário */
    const user = await prisma.users.findFirst({
      where: {
        email,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    /* Verificar se a senha é válida */
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch === false)
      return res.status(400).json({ message: "Invalid Credentials" });

    /* Gerar token JWT */
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* Retornar cookie no response header */
    // res.cookie("copyei_user", token, {
    //   path: "/",
    //   expiresIn: "7d", // 7 dias
    // });

        /* Retornar cookie no response header */
        res.cookie("copyei_user", token, {
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
          domain: ".copyei.online",  // compartilha entre app e api
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          httpOnly: true,
        });

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
      error: "Ocorreu um erro inesperado. Tente novamente mais tarde...",
    });
  }
}
