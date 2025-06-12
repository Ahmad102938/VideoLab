import { PrismaClient } from "@prisma/client";
console.log("🌱 prisma.ts loaded!");
const prisma = new PrismaClient();
export default prisma;
