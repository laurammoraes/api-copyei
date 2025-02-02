import { prisma } from "../../lib/prisma.js";


export async function downloadSheetWithAllUsers(req, res) {
    try {
        const pageSize = 1000;
        let page = 0;
        let users = [];
        let batch;


        do {
            batch = await prisma.users.findMany({
                where: {
                    deleted_at: null,
                    paused_at: null
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
                },
                take: pageSize,
                skip: page * pageSize
            });

            users = [...users, ...batch];
            page++;
        } while (batch.length > 0);


        const planilhaDados = users.map(user => {
            const websites = user.Websites.map(site => site.clone_url).join(", ");
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

        const job = await excelQueue.add("generateExcel", { data: planilhaDados });

        console.log(`📌 Job ${job.id} adicionado à fila`);


        queueEvents.on("completed", async ({ jobId, returnvalue }) => {
            if (jobId === job.id) {
                const filePath = returnvalue.filePath;
                console.log(`✅ Job ${jobId} finalizado, enviando arquivo...`);
                res.download(filePath);
            }
        });
    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        res.status(500).json({ message: "Erro interno" });
    }


}
