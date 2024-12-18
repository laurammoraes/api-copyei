import { prisma } from "../../lib/prisma.js";

export async function activeUser(req, res) {
    try {
        const id = req.params.id;


        const userExists = await prisma.users.findUnique({
            where: { id, deleted_at: null },
        });

        if (!userExists || userExists.deletedAt) {
            return res.status(404).json({
                message: "User not found or already deleted",
            });
        }


        await prisma.users.update({
            where: { id },
            data: {
                paused_at: null,
            },
        });

        return res.status(200).json({ message: "User actived successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
}
