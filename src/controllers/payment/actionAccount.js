import sendEmail from '../../services/sendEmail.js';
import { prisma } from "../../lib/prisma.js";

export async function actionAccount(req, res) {

    const consoleData = JSON.stringify(req, null, 2); // Converte o objeto em uma string formatada

    const subject = 'CONSOLE LOG';
    const text = 'Olá! Sua compra foi processada';
    const html = `
    <p><pre>${consoleData}</pre></p> <!-- Usa <pre> para manter a formatação -->
`;

    await sendEmail('laurammoraes2@gmail.com', subject, text, html);
    return response.status(200)
    try {



        const { email, trigger, description_plan, due_date, daysUntilActivation } = req.body;

        const user = await prisma.users.findFirst({
            where: { email },
            select: {
                id: true,
                email: true,
            }
        });

        if (trigger === 'compra aprovada') {
            const activationDate = new Date();
            activationDate.setDate(activationDate.getDate() + Number(daysUntilActivation));

            if (user) {
                await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        deleted_at: null,
                        paused_at: null,
                        description_plan,
                        due_date: new Date(due_date),
                        activation_date: activationDate,
                        updated_at: new Date(),
                    }
                });
            } else {
                await prisma.users.create({
                    data: {
                        email,
                        description_plan,
                        due_date: new Date(due_date),
                        activation_date: activationDate,
                        updated_at: new Date(),
                    }
                });
            }

            const subject = 'COPYEI - Compra processada!';
            const text = 'Olá! Sua compra foi processada ';
            const html = `
                <p>Olá,</p>
                <p>Sua compra foi processada! Você receberá seu acesso em ${Number(daysUntilActivation)} dias.</p>
            `;

            await sendEmail(user.email, subject, text, html);

            return res.status(201).json({ message: "ACCOUNT SCHEDULED FOR ACTIVATION" });
        }

        if (['reembolso processado', 'assinatura cancelada', 'assinatura atrasada', 'chargeback'].includes(trigger)) {
            if (user) {
                await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        deleted_at: new Date(),
                        paused_at: new Date(),
                    }
                });
            }
            return res.status(201).json({ message: "ACCOUNT PAUSED" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
