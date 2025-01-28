
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.zeptomail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'emailapikey',
        pass: process.env.PASSEMAIL
    },
    authMethod: 'PLAIN',

});


export default async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: '<contato@copyei.com>',
            to,
            subject,
            text,
            html
        });


        return info;
    } catch (error) {
        console.error('Erro ao enviar o email:', error);
        throw error;
    }
}


