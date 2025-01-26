const cron = require("node-cron");
import sendEmail from '../services/sendEmail';

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


async function sendReminderEmail(email) {
  try {

    const subject = "Lembrete Copyei: Renovação do Plano";
    const text = 'Olá! Recupere sua senha pelo link abaixo';
    const html = `
                <p>Olá,</p>
                <p>Olá! O prazo de renovação do seu plano expira em breve. Não se esqueça de renová-lo!</p>
            `;


    await sendEmail(email, subject, text, html);

   
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${email}:`, error);
  }
}


cron.schedule("0 9 * * *", async () => {
  

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  try {
    
    const usersToNotify = await prisma.user.findMany({
      where: {
        due_date: sevenDaysFromNow,
      },
    });
    
    for (const user of usersToNotify) {
      await sendReminderEmail(user.email, user.due_date);
    }
  } catch (error) {
    console.error("Erro ao buscar usuários ou enviar e-mails:", error);
  }
});
