import { z, ZodError } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma.js";
const resetBodySchema = z.object({
    password: z
        .string()
        .min(6)
        .max(72)
        .regex(/^(?=.*[a-zA-Z])/, "The password must have a letter")
        .regex(/^(?=.*\d)/, "The password must have a number")
        .regex(/^(?=.*[@.#$!%*?&^])/, "The password must have special character"),
    repeatPassword: z.string().min(6).max(72),
});

export async function recoverPassword(req, res) {
    try {
        const id = req.params.id
        const { password, repeatPassword } = resetBodySchema.parse(
            req.body
        )

        if (password !== repeatPassword) return res.status(400).json({ message: "Passwords Do Not Match" });

        const hash = await bcrypt.hash(password, 12);

        await prisma.users.update({
            where: {
                id: id,
                deleted_at: null,
                paused_at: null
            },
            data: {
                password: hash
            }
        })

        return res.status(200).json({ message: "UPDATED" })

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Data Parse Error",
                errors: error.flatten().fieldErrors,
            });
        }


        return res.status(500).json({
            error: "Ocorreu um erro inesperado. Tente novamente mais tarde...",
        });

    }

}