import { prisma } from "../../lib/prisma.js";

export async function listUsers(req, res) {
    try {
        const page = 1;
        const limit = 10;
        const skip = (Number(page) - 1) * Number(limit);

        let filters = {};

        if (req.query) {
            const { name, email, status, role } = req.query;

            if (name) {
                filters.name = {
                    contains: name,
                    mode: "insensitive"
                };
            }

            if (email) {
                filters.email = {
                    contains: email,
                    mode: "insensitive"
                };
            }

            if (status && status === 'Ativo') {
                
                filters.deleted_at = null

                filters.paused_at = null
            }

            if (status && status === 'Inativo') {
                
                
                filters.deleted_at = {not: null},
                filters.paused_at = { not: null }
                
            }

            if (role) {
                filters.role = role
            }
        }

        // Buscando usuários com o filtro correto
        const users = await prisma.users.findMany({
            where: filters,
            skip,
            take: Number(limit),
        });

        // Contando o total de usuários com o filtro
        const total = await prisma.users.count({
            where: filters,
        });

        return res.status(200).json({
            data: users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
}
