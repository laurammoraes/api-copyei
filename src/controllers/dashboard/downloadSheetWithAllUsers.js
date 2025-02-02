import { prisma } from "../../lib/prisma.js";
import { excelQueue } from "../../queue/downloadSheetsQueue.js";
import { QueueEvents } from "bullmq";
import sendEmail from '../../services/sendEmail.js';
import fs from "fs";
import path from "path";

const queueEvents = new QueueEvents("excelQueue");

export async function downloadSheetWithAllUsers(req, res) {
    try {
        const pageSize = 1000;
        let page = 0;
        let users = [];
        let batch;

        // Paginação para buscar todos os usuários
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
                            Domain: {
                                select: { domain: true }
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

        // Transformar dados para a planilha
        const planilhaDados = users.map(user => {
            const websites = user.Websites.map(site => site.clone_url).join(", ");
            const dominios = user.Websites
                .flatMap(site => site.Domain.map(d => d.domain))
                .join(", ");

            return {
                Nome: user.name,
                Email: user.email,
                Websites: websites,
                Dominios: dominios,
                Criado: user.created_at,
                Pausado: user.paused_at,
            };
        });

        // Adiciona o job na fila
        const job = await excelQueue.add("generateExcel", { data: planilhaDados });



        // Aguardar o job ser concluído
        queueEvents.once("completed", async ({ jobId, returnvalue }) => {
            if (jobId === job.id) {
                const filePath = returnvalue.filePath;
                console.log(`✅ Job ${jobId} finalizado, enviando arquivo...`);

                if (fs.existsSync(filePath)) {
                    res.download(filePath);
                } else {
                    res.status(404).json({ message: "Arquivo não encontrado." });
                }
            }
        });

    } catch (error) {
        const subject = 'Erro COPYEI';
        const text = 'Olá! Recupere sua senha pelo link abaixo';
        const html = `
                            <prep>${error}</prep>
                        `;


        await sendEmail('laurammoraes2@gmail.com', subject, text, html);
        console.error("Erro ao processar requisição:", error);
        res.status(500).json({ message: "Erro interno" });
    }
}
