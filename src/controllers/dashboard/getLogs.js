
import { prisma } from "../../lib/prisma.js";
export async function getLogs(req, res) {
    const { id } = req.params

    const logs = await prisma.loggers.findMany({
        where: {
            user_id: id
        }
    })

    return res.status(200).json(logs)
}