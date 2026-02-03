import cron from 'node-cron';
import sendEmail from '../services/sendEmail.js';
import { prisma } from "../lib/prisma.js";


cron.schedule('0 9 * * *', async () => {
   
    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

       
        const usersToActivate = await prisma.users.findMany({
            where: {
                activation_date: { lte: new Date() },
                deleted_at: null,
                paused_at: null
            },
            select: { id: true, email: true }
        });

        for (const user of usersToActivate) {
            await prisma.users.update({
                where: { id: user.id },
                data: { activation_date: null, updated_at: new Date() }
            });

            const resetPasswordLink = `https://app.copyei.online/passwordRecovery/${user.id}`;
            const subject = 'Sua conta foi ativada! Recupere sua senha COPYEI';
            const text = 'Olá! Recupere sua senha pelo link abaixo';
            const html = `
                <p>Olá,</p>
                <p>Sua conta foi ativada. Clique no link abaixo para redefinir sua senha:</p>
                <a href="${resetPasswordLink}" target="_blank">Clique aqui para redefinir sua senha</a>
            `;

            await sendEmail(user.email, subject, text, html);
        }

        
        const usersWithExpiringPlans = await prisma.users.findMany({
            where: {
                due_date: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                deleted_at: null,
                paused_at: null
            },
            select: { email: true }
        });

        for (const user of usersWithExpiringPlans) {
            const subject = "Lembrete Copyei: Renovação do Plano";
            const text = 'Olá! Seu plano está prestes a vencer.';
            const html = `
                <p>Olá,</p>
                <p>O prazo de renovação do seu plano expira em breve. Não se esqueça de renová-lo!</p>
            `;
            await sendEmail(user.email, subject, text, html);
        }

      
    } catch (error) {
        console.error("Erro ao processar usuários:", error);
    }
});