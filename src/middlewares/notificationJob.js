import cron from "node-cron"
import sendEmail from  '../services/sendEmail.js'
import PrismaClient from "@prisma/client"


import { prisma } from "../lib/prisma.js";

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
  

  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  
  const startOfDay = new Date(sevenDaysFromNow.setHours(0, 0, 0, 0));
  const endOfDay = new Date(sevenDaysFromNow.setHours(23, 59, 59, 999));

  try {
    
    const usersToNotify = await prisma.users.findMany({
      where: {
        due_date: {
          gte: startOfDay, 
          lt: endOfDay,    
        },
      },
    });

    for (const user of usersToNotify) {
      await sendReminderEmail(user.email, user.due_date);
    }
  } catch (error) {
    console.error("Erro ao buscar usuários ou enviar e-mails:", error);
  }
});
