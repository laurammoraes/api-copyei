import sendEmail from '../../services/sendEmail.js';
import { prisma } from "../../lib/prisma.js";

export async function actionAccount(req, res) {

    try {
        const { email, trigger, description_plan, due_date } = req.body



        const user = await prisma.users.findFirst({
            where: {
                email
            },
            select: {
                id: true,
                email: true,

            }
        })

        if (trigger === 'compra aprovada') {
            if (user) {
                await prisma.users.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        deleted_at: null,
                        paused_at: null,
                        description_plan,
                        due_date: new Date(due_date),
                        updated_at: new Date(),
                    }
                })

                const resetPasswordLink = `https://app.copyei.com/passwordRecovery/${user.id}`;

                const subject = 'Compra aprovada, recupere sua senha COPYEI';
                const text = 'Olá! Recupere sua senha pelo link abaixo';
                const html = `
                            <p>Olá,</p>
                            <p>Sua conta foi criada. Clique no link abaixo para redefinir sua senha:</p>
                            <a href="${resetPasswordLink}" target="_blank">Clique aqui para redefinir sua senha</a>
                        `;


                await sendEmail(email, subject, text, html);

                return res.status(201).json({ message: "CREATED" });

            }

            const createUser = await prisma.users.create({
                data: {
                    email,
                    description_plan,
                    due_date: new Date(due_date),
                    updated_at: new Date(),
                }
            })

            const resetPasswordLink = `https://app.copyei.com/passwordRecovery/${createUser.id}`;

            const subject = 'Compra aprovada, recupere sua senha COPYEI';
            const text = 'Olá! Recupere sua senha pelo link abaixo';
            const html = `
                        <p>Olá,</p>
                        <p>Sua conta foi criada. Clique no link abaixo para redefinir sua senha:</p>
                        <a href="${resetPasswordLink}" target="_blank">Clique aqui para redefinir sua senha</a>
                    `;


            await sendEmail(email, subject, text, html);

            return res.status(201).json({ message: "CREATED" });
        }

        if (trigger === 'reembolso processado' || trigger === 'assinatura cancelada' || trigger === 'assinatura atrasada' || trigger === 'chargeback') {
            await prisma.users.update({
                where: {
                    id: user.id
                },
                data: {
                    deleted_at: new Date(),
                    paused_at: new Date(),
                }
            })

            return res.status(201).json({ message: "ACCOUNT PAUSED" });
        }



    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })

    }
}