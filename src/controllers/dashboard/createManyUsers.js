import { prisma } from "../../lib/prisma.js";
import sendEmail from '../../services/sendEmail.js';
import bcrypt from "bcrypt";
import xlsx from "xlsx";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            cb(null, true);
        } else {
            cb(new Error("Apenas arquivos .xlsx são permitidos"));
        }
    }
}).single("file");

export async function createManyUsers(req, res) {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: "Nenhum arquivo enviado" });
            }

            const workbook = xlsx.read(req.file.buffer);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const users = xlsx.utils.sheet_to_json(worksheet);

            if (!users || !Array.isArray(users)) {
                return res.status(400).json({ message: "Planilha sem dados válidos" });
            }

            const createdUsers = [];
            const errors = [];

            for (const userData of users) {
                const { nome: name, email } = userData;

                if (!name || !email) {
                    errors.push(`Dados incompletos para o usuário ${email || name}`);
                    continue;
                }

                const userExists = await prisma.users.findFirst({
                    where: {
                        email,
                        deleted_at: null,
                    },
                });

                if (userExists) {
                    errors.push(`Usuário com email ${email} já existe`);
                    continue;
                }

                const password = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = await prisma.users.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                    },
                });

                createdUsers.push({
                    id: user.id,
                    email: user.email,
                    temporaryPassword: password,
                });

                const resetPasswordLink = `https://app.copyei.online/passwordRecovery/${user.id}`;

                const subject = 'Recupere sua senha COPYEI';
                const text = 'Olá! Recupere sua senha pelo link abaixo';
                const html = `
                    <p>Olá,</p>
                    <p>Sua conta foi criada. Clique no link abaixo para redefinir sua senha:</p>
                    <a href="${resetPasswordLink}" target="_blank">Clique aqui para redefinir sua senha</a>
                   
                `;


                await sendEmail(email, subject, text, html);
            }

            return res.status(201).json({
                message: "Processamento da planilha concluído",
                created: createdUsers,
                errors: errors.length > 0 ? errors : undefined,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
}
