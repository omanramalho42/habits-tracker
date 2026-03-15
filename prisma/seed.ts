// import { HabitStatus, PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// async function main() {

//   /*USERS*/
//   await prisma.user.createMany({
//     data: [
//       {
//         id: "16a203fa-f4cc-4600-8622-18cdb2bccfc9",
//         clerkUserId: "user_3Ats1sNrD3bs4jwwhCgw4jJeqk",
//         email: "gabriellemosc@gmail.com",
//         firstName: "Gabriel",
//         lastName: null,
//         imageUrl: null,
//         createdAt: new Date("2026-03-13T17:02:09.774Z"),
//         updatedAt: new Date("2026-03-13T17:02:09.774Z")
//       },

//       {
//         id: "28503349-a1d4-4bad-8a11-f3d1376745c9",
//         clerkUserId: "user_3AmpWKpNbP4zF7QZQyVPLy66",
//         email: "anacristinapesoa4@gmail.com",
//         firstName: "Ana Cristina",
//         lastName: null,
//         imageUrl: null,
//         createdAt: new Date("2026-03-14T21:40:47.375Z"),
//         updatedAt: new Date("2026-03-14T21:40:47.375Z")
//       },

//       {
//         id: "428025f7-37f2-4b75-8a99-fc63a1ad5e8",
//         clerkUserId: "user_38dU5rkqoA477a3j6uwiGQR7dF",
//         email: "catarinacosta@gmail.com",
//         firstName: "ana 🥰",
//         lastName: null,
//         imageUrl: null,
//         createdAt: new Date("2026-01-23T03:39:21.497Z"),
//         updatedAt: new Date("2026-01-23T03:39:21.497Z")
//       },

//       {
//         id: "6a0f5e35-480e-4579-b767-29129bc9e3a7",
//         clerkUserId: "user_3BcbndJ4nCmsYoflqUpPl7grFa",
//         email: "omanapple42@gmail.com",
//         firstName: "Oman",
//         lastName: null,
//         imageUrl: null,
//         createdAt: new Date("2026-01-22T10:12:59.086Z"),
//         updatedAt: new Date("2026-01-22T10:12:59.086Z")
//       },

//     ],
//     skipDuplicates: true
//   })

//   /*GOALS*/
//   await prisma.goals.createMany({
//     data: [
//       {
//         id: "df4f9dac-0ef8-49cd-b8cf-8931f20cb178",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Colocar app em produção",
//         description: "ser capaz de colocar o app habits em produção com planos de recorrência ativos e plano gratuito com limitação de ferramentas e criação de hábitos (10 hábitos ) plano gratuito . ",
//         emoji: "📱",
//         createdAt: new Date("2026-03-06T03:06:02.473Z"),
//         status: HabitStatus.ACTIVE
//       },
//       {
//         id: "72fb2326-853b-4009-a9f6-a46f7d3173b8",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Leitura",
//         description: "Aprimorar conhecimentos gerais e aumentar o intelecto através da leitura de bons livros",
//         emoji: "📚",
//         createdAt: new Date("2026-03-06T03:06:02.473Z"),
//         status: HabitStatus.ACTIVE
//       },
//       {
//         id: "aaf26fdd-9053-4cc6-8ed4-21488dad7aaf",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Alcançar 70kg",
//         description: "Conseguir alcançar 70kg",
//         emoji: "✨",
//         createdAt: new Date("2026-03-06T03:06:02.473Z"),
//         status: HabitStatus.ACTIVE
//       },
//       {
//         id: "7184194f-be0e-45da-9b06-48bd3b111c7b",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Manutenção do carro",
//         description: "manter o carro em dia",
//         emoji: "🚗",
//         createdAt: new Date("2026-03-06T03:06:02.473Z"),
//         status: HabitStatus.ACTIVE
//       }
//     ],
//     skipDuplicates: true
//   })

//   //HABITS
//   await prisma.habit.createMany({
//     data: [
//       {
//         id: "d9886707-c49d-46f3-ba14-07a8b8fac442",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Beber agua",
//         emoji: "💧",
//         customField: "litros",
//         limitCounter: 5,
//         clock: "10:30:50",
//         status: HabitStatus.ACTIVE,
//         startDate: new Date("2026-01-24T03:00:00.000Z"),
//         endDate: new Date("2026-01-26T03:00:00.000Z"),
//         reminder: true,
//         frequency: ["S","M","T","W","TH","F","SA"],
//         color: "#138de5",
//         createdAt: new Date("2026-01-25T10:56:13.780Z")
//       },
//       {
//         id: "f846f4ef-bf4e-4041-9c15-6cbb78d11ac5",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "App habits",
//         emoji: "👾",
//         limitCounter: 1,
//         status: HabitStatus.ACTIVE,
//         startDate: new Date("2026-01-22T22:52:44.992Z"),
//         frequency: ["S","M","T","W","TH","F","SA"],
//         color: "#7c00ff",
//         createdAt: new Date("2026-01-22T22:55:48.543Z")
//       },
//       {
//         id: "539057a2-1bb8-4531-b505-2bccfaabc294",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Sapiens",
//         emoji: "📖",
//         limitCounter: 10,
//         status: HabitStatus.ACTIVE,
//         startDate: new Date("2026-01-22T03:00:00.000Z"),
//         endDate: new Date("2026-03-31T03:00:00.000Z"),
//         reminder: true,
//         frequency: ["S","M","T","W","TH","F","SA"],
//         color: "#1fea1e",
//         createdAt: new Date("2026-01-22T22:57:36.896Z")
//       },
//       {
//         id: "2f936da1-e552-46f2-8109-632a6f55c1d7",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Academia",
//         emoji: "🏋️",
//         limitCounter: 1,
//         status: HabitStatus.ACTIVE,
//         startDate: new Date("2026-01-22T22:57:37.916Z"),
//         frequency: ["S","M","T","W","TH","F","SA"],
//         color: "#16ceb5",
//         createdAt: new Date("2026-01-22T23:00:12.955Z")
//       }
//     ],
//     skipDuplicates: true
//   })

//   /*RELACIONAR HABITS COM GOALS*/
//   await prisma.goals.update({
//     where: { id: "df4f9dac-0ef8-49cd-b8cf-8931f20cb178" },
//     data: {
//       habits: {
//         connect: [
//           { id: "d9886707-c49d-46f3-ba14-07a8b8fac442" },
//           { id: "f846f4ef-bf4e-4041-9c15-6cbb78d11ac5" }
//         ]
//       }
//     }
//   })

//   await prisma.annotations.createMany({
//     data: [
//       {
//         id: "9689106d-a94e-4a55-9e10-7bcfcefd5254",
//         name: "test",
//         content: "",
//         summary: "teste",
//         createdByAI: false,
//         imageUrl: null,
//         completionId: "57ff59ca-d3e7-40dd-83b4-6bc4a3b2fee8",
//         createdAt: new Date("2026-03-06T03:06:02.391Z")
//       },
//       {
//         id: "b2400716-497e-4ef6-915b-0401d1aebcff",
//         name: "Treino de costas",
//         content: "",
//         summary: "Treino pesado de costas para voltar ao hábito",
//         createdByAI: false,
//         imageUrl: "https://res.cloudinary.com/dxx3qxsxt/image/upload/v1769223133/annotations/garjshfydworuv4jncx7.jpg",
//         completionId: "80696550-54d4-4103-a222-93d5c5757f5b",
//         createdAt: new Date("2026-03-06T03:06:02.391Z")
//       },
//       {
//         id: "cb0b636c-c9b0-4489-8eaf-7d130832a571",
//         name: "Lavar o carro com Thiago",
//         content: "",
//         summary: "Lavamos o carro e aspiramos",
//         createdByAI: false,
//         imageUrl: "https://res.cloudinary.com/dxx3qxsxt/image/upload/v1769223274/annotations/xgp6i4elrxiulrazimt2.jpg",
//         completionId: "765163fb-332b-4c49-8597-314a59de91c3",
//         createdAt: new Date("2026-03-06T03:06:02.391Z")
//       },
//       {
//         id: "05397fea-1146-4d4d-b38b-ba748966cc33",
//         name: "teste",
//         content: "",
//         summary: "TSTE",
//         createdByAI: false,
//         imageUrl: "https://res.cloudinary.com/dxx3qxsxt/image/upload/v1769144795/annotations/oducu3cyq1g0vo825nbg.png",
//         completionId: "509f061c-ae6d-4a3d-a134-837985aa0277",
//         createdAt: new Date("2026-03-06T03:06:02.391Z")
//       },
//       {
//         id: "aa6e09f0-3512-4c49-8dc5-7102191e0702",
//         name: "Volta a agua",
//         content: "",
//         summary: "Voltei a surfar levei mt caldo a prancha tá pesada e o equilíbrio tá parecendo um bloco de cimento",
//         createdByAI: false,
//         imageUrl: "https://res.cloudinary.com/dxx3qxsxt/image/upload/v1769318952/annotations/lkmts1enn9y9ty48u8rr.jpg",
//         completionId: "19dc6ba3-13d4-40f9-93f1-e4d8451a24be",
//         createdAt: new Date("2026-03-06T03:06:02.391Z")
//       },
//       {
//         id: "4970cc0b-b1e5-466d-a30e-fad11d4beae5",
//         name: "Finalizar versão beta do app habitos",
//         content: "",
//         summary: "configurar versão inicial do app e verificar processo de webhooks",
//         createdByAI: false,
//         imageUrl: "https://res.cloudinary.com/dxx3qxsxt/image/upload/v1769917391/annotations/bws0unypnyne034cffpv.jpg",
//         completionId: "13638959-069e-4ae2-b7f5-eed13b05f318",
//         createdAt: new Date("2026-03-06T03:06:02.391Z")
//       }
//     ],
//     skipDuplicates: true
//   })

//   await prisma.routine.createMany({
//     data: [
//       {
//         id: "abca4a75-fbcb-4b07-95bf-d56340072608",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Treino de peito",
//         description: "Teeino de peitoral (midial , superior, inferior)",
//         startDate: new Date("2026-03-09T03:00:00.000Z"),
//         endDate: null,
//         cron: "semanalmente",
//         frequency: ["M","SA"],
//         emoji: "✨",
//         status: "ACTIVE",
//         createdAt: new Date("2026-03-09T11:55:51.287Z"),
//         updatedAt: new Date("2026-03-09T12:51:34.965Z")
//       },
//       {
//         id: "0adfe9d2-d3a7-4761-8d55-afae10c9f06d",
//         userId: "6a0f5e35-409e-4579-b767-29129cbe93a7",
//         name: "Desenvolver app",
//         description: "desenvolver softwares escaláveis",
//         startDate: new Date("2026-03-09T00:00:00.000Z"),
//         cron: "semanalmente",
//         frequency: ["S","M","TH","F","SA","T","W"],
//         emoji: "👾",
//         status: "ACTIVE",
//         createdAt: new Date("2026-03-09T16:38:35.489Z"),
//         updatedAt: new Date("2026-03-09T16:38:35.489Z")
//       }
//     ],
//     skipDuplicates: true
//   })
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })