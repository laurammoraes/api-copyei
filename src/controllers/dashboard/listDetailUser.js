import { prisma } from "../../lib/prisma.js";

export async function listDetailUser(req, res) {
    try {
        const id = req.params.id;

        const user = await prisma.users.findUnique({
            where: {
                id,
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                description_plan: true,
                due_date: true,
                Domains: {
                    select: {
                        id: true,
                        domain: true,

                    },
                },
                Websites: {
                    select: {
                        id: true,
                        clone_url: true,
                        title: true
                    },
                },
                created_at: true,
                paused_at: true,
            },

        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }



        const usageDuration = {
            days: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
            isPaused: user.paused_at !== null
        };

        return res.status(200).json({
            ...user,
            usageDuration
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
}