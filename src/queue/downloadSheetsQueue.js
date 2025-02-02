const { Queue } = require("bullmq");


const excelQueue = new Queue("excelQueue", {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
        removeOnComplete: true,
    },
});

module.exports = { excelQueue };
