
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.zeptomail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'emailapikey',
        pass: 'wSsVR610/ETyB6osyTCkLu85mQxRAFz/FRsojFan43D+H6/A8Mdqk0KfBACgSfUWGDZrEGRDpb99mBhS1WEL3Y8vyllVXCiF9mqRe1U4J3x17qnvhDzMXm9dlxeAKo0IxAVuk2RmFssr+g=='
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


