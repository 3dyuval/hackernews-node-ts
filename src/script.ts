import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const allLinks = await prisma.link.findMany()
	console.log(allLinks)
}

main().finally(async () => {
	await prisma.$disconnect()
})
