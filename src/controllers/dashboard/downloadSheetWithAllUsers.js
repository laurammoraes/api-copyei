import { prisma } from "../../lib/prisma.js";
import xlsx from "xlsx";

export async function downloadSheetWithAllUsers(req, res) {
    try {

        const users = await prisma.users.findMany({
            where: {
                deleted_at: null
            },
            select: {
                name: true,
                email: true,
                created_at: true,
                paused_at: true,
                Websites: {
                    select: {
                        clone_url: true,
                        title: true,
                        Domain: {
                            select: {
                                domain: true
                            }
                        }
                    }
                }
            }
        });


        const planilhaDados = users.map(user => {
            const websites = user.Websites.map(site => site.siteDomain).join(", ");
            const dominios = user.Websites
                .flatMap(site => site.Domain.map(d => d.domain))
                .join(", ");

            return {
                Nome: user.name,
                Email: user.email,
                Criado: user.created_at,
                Pausado: user.paused_at,
                Websites: websites,
                Dominios: dominios
            };
        });


        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(planilhaDados);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Usuários");


        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });


        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=usuarios.xlsx");

        return res.send(buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
}
