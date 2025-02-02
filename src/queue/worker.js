import { Worker } from "bullmq";
import { excelQueue } from "./queue";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";

const storagePath = path.join(__dirname, "downloads");

// Criar a pasta de armazenamento, se não existir
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
}

const excelWorker = new Worker(
    "excelQueue",
    async (job) => {


        const { data } = job.data;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Usuários");

        // Cabeçalhos
        worksheet.addRow(["Nome", "Email", "Criado", "Pausado"]);
        data.forEach(user => worksheet.addRow([user.Nome, user.Email, user.Criado, user.Pausado]));

        // Caminho do arquivo
        const filePath = path.join(storagePath, `planilha-${job.id}.xlsx`);
        await workbook.xlsx.writeFile(filePath);



        return { filePath };
    },
    { connection: excelQueue.opts.connection }
);


