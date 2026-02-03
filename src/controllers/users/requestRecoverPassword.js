import sendEmail from '../../services/sendEmail.js';
import { prisma } from "../../lib/prisma.js";


export async function requestRecoverPassword(req, res) {
    const email = req.body.email;

    try {
        const user = await prisma.users.findFirst({
            where: {
                email,
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
            },
        });


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetPasswordLink = `https://app.copyei.online/passwordRecovery/${user.id}`;

        const subject = 'Recupere sua senha';
        const text = 'Olá! Recupere sua senha pelo link abaixo';
        const html = `
            <p>Olá ${user.name},</p>
            <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefini-la:</p>
            <a href="${resetPasswordLink}" target="_blank">Clique aqui para redefinir sua senha</a>
            <p>Se você não solicitou essa recuperação, ignore este e-mail.</p>
        `;


        await sendEmail(email, subject, text, html);


        return res.status(200).json({ message: 'Email enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        return res.status(500).json({ message: 'Erro ao processar a solicitação' });
    }
}
