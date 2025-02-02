import sendEmail from '../../services/sendEmail.js';
import { prisma } from "../../lib/prisma.js";

export async function actionAccount(req, res) {
    try {
        const email = req.body.Customer.email;
        const description_plan = req.body.Product.product_name;
        const trigger = req.query.trigger;
        const daysUntilActivation = req.query.daysUntilActivation;
        const planType = req.query.plan_type;

        let user = await prisma.users.findFirst({
            where: { email },
            select: {
                id: true,
                email: true,
            }
        });

        if (trigger === 'compra aprovada') {
            const activationDate = new Date();
            activationDate.setDate(activationDate.getDate() + Number(daysUntilActivation));

            const dueDate = new Date();
            if (planType === "anual") {
                dueDate.setFullYear(dueDate.getFullYear() + 1);
            } else if (planType === "mensal") {
                dueDate.setMonth(dueDate.getMonth() + 1);
            }

            if (user) {
                await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        deleted_at: null,
                        paused_at: null,
                        description_plan,
                        due_date: dueDate,
                        activation_date: activationDate,
                        updated_at: new Date(),
                    }
                });
            } else {
                const hash = await bcrypt.hash(password, 10);

                user = await prisma.users.create({
                    data: {
                        email,
                        name: email,
                        password: hash,
                        description_plan,
                        due_date: dueDate,
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
