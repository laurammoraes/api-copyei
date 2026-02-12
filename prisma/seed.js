import bcrypt from "bcrypt";

import { prisma } from "../src/lib/prisma.js";

async function seed() {
  await prisma.websites.deleteMany();
  await prisma.domains.deleteMany();
  await prisma.users.deleteMany();

  const hash = await bcrypt.hash("Copyei2024!@#", 12);

  const user = await prisma.users.create({
    data: {
      name: "Administrador Copyei",
      email: "copyei@gmail.com",
      password: hash,
      role: "ADMIN",
    },
  });

  await prisma.domains.createMany({
    data: [
      { user_id: user.id, domain: "copyei.com" },
      { user_id: user.id, domain: "copyei.online" },
    ],
  });

  await prisma.$disconnect();
}

seed()
  .then(() => {
    console.warn({ message: "Database Seeded!" });
  })
  .catch((error) => console.error({ error }));
