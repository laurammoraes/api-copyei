import { prisma } from "../../lib/prisma.js";

export async function deleteUser(req, res) {
    try {
        const id = req.params.id;

        const userExists = await prisma.users.findUnique({
            where: { id, deleted_at: null },
        });

        if (!userExists || userExists.deletedAt) {
            return res.status(404).json({ message: "Usuário não encontrado ou já deletado" });
        }

        await prisma.users.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });

        return res.status(200).json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
}
