import { prisma } from "../../lib/prisma.js";

export async function updateRoleUser(req, res) {
    try {
        const email = req.body.email
        const role = req.body.role

        const userExists = await prisma.users.findFirst({
            where: { email, deleted_at: null, paused_at: null },
        });


        if (!userExists || userExists.deletedAt || userExists.pausedAt) {
            return res.status(404).json({
                message: "Usuário não encontrado, já deletado ou já pausado",
            });
        }


        await prisma.users.update({
            where: { id: userExists.id },
            data: {
                role
            },
        });

        return res.status(200).json({ message: "Role do usuário agora é ADMIN" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
}
