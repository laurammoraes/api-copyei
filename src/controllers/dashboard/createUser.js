import { z, ZodError } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma.js";

const registerBodySchema = z.object({
    name: z.string().max(255),
    email: z.string().email(),
});

export async function createUser(req, res) {
    try {
        const { name, email } = registerBodySchema.parse(
            req.body
        );

        const password = generatePassword()


        const duplicatedEmail = await prisma.users.findFirst({
            where: {
                email,
                deleted_at: null
            },

        });
        if (duplicatedEmail)
            return res.status(400).json({ message: "Email Already Exists" });

        const hash = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: {
                name,
                email,
                password: hash,
            },
        });

        return res.status(201).json({ message: "CREATED" });
    } catch (error) {

        console.log(error)
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


function generatePassword() {
    const minLength = 6;
    const maxLength = 12;

    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "@.#$!%*?&^";

    const requiredChars = [
        letters[Math.floor(Math.random() * letters.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];

    const allChars = letters + numbers + specialChars;
    const remainingLength = Math.floor(
        Math.random() * (maxLength - minLength + 1) + minLength
    ) - requiredChars.length;

    for (let i = 0; i < remainingLength; i++) {
        requiredChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    const shuffledPassword = requiredChars
        .sort(() => Math.random() - 0.5)
        .join("");

    return shuffledPassword;
}


