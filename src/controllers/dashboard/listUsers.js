import { prisma } from "../../lib/prisma.js";

export async function listUsers(req, res) {
    try {

        const page = 1
        const limit = 10
        const skip = (Number(page) - 1) * Number(limit);


        const filters = {
            deleted_at: null,
        };

        if (req.params) {
            const { name, email, status, role } = req.params;

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

            if (status) {
                filters.status = status;
            }

            if (role) {
                filters.role = role;
            }
        }

        const users = await prisma.users.findMany({
            where: filters,
            skip,
            take: Number(limit),
        });

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
