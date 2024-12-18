import { prisma } from "../../lib/prisma.js";

export async function listUsers(req, res) {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const users = await prisma.users.findMany({
            where: {
                deleted_at: null,
            },
            skip,
            take: limit,
        });


        const total = await prisma.users.count({
            where: {
                deleted_at: null,
            },
        });


        return res.status(200).json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}