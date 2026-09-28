import { PrismaClient, RequirementFieldType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('?? ???????????????????????...');
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.gameRequirement.deleteMany();
  await prisma.game.deleteMany();
  await prisma.paymentMethod.deleteMany();

  console.log('?? ??????????? Payment Methods...');
  await prisma.paymentMethod.createMany({
    data: [
      {
        name: 'Bakong KHQR',
        code: 'KHQR',
        provider: 'BAKONG',
        logoUrl: '/images/payments/khqr.png',
        sortOrder: 1,
      },
      {
        name: 'ABA PayWay',
        code: 'ABA_PAYWAY',
        provider: 'ABA',
        logoUrl: '/images/payments/aba.png',
        sortOrder: 2,
      },
    ],
  });

  console.log('?? ??????????????????? Mobile Legends...');
  await prisma.game.create({
    data: {
      name: 'Mobile Legends: Bang Bang',
      slug: 'mobile-legends',
      description: '??????????? Mobile Legends ?????? ?????????? ?????????????????',
      logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop',
      publisher: 'Moonton',
      sortOrder: 1,
      requirements: {
        create: [
          {
            fieldName: 'userId',
            label: 'User ID',
            type: RequirementFieldType.TEXT,
            required: true,
            placeholder: '???????? 12345678',
            sortOrder: 1,
          },
          {
            fieldName: 'zoneId',
            label: 'Zone ID',
            type: RequirementFieldType.TEXT,
            required: true,
            placeholder: '???????? 1234',
            sortOrder: 2,
          },
        ],
      },
      products: {
        create: [
          { name: '86 Diamonds', sku: 'MLBB-86', amount: 86, price: 1.50, sortOrder: 1 },
          { name: '172 Diamonds', sku: 'MLBB-172', amount: 172, price: 3.00, sortOrder: 2 },
          { name: '257 Diamonds', sku: 'MLBB-257', amount: 257, price: 4.50, sortOrder: 3 },
          { name: '706 Diamonds', sku: 'MLBB-706', amount: 706, price: 12.00, sortOrder: 4 },
        ],
      },
    },
  });

  console.log('?? ??????????????????? Free Fire...');
  await prisma.game.create({
    data: {
      name: 'Free Fire',
      slug: 'free-fire',
      description: '??????????? Free Fire ???????????????? Player ID?',
      logoUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=400&fit=crop',
      publisher: 'Garena',
      sortOrder: 2,
      requirements: {
        create: [
          {
            fieldName: 'playerId',
            label: 'Player ID (UID)',
            type: RequirementFieldType.TEXT,
            required: true,
            placeholder: '?????? UID ????????',
            sortOrder: 1,
          },
        ],
      },
      products: {
        create: [
          { name: '100 Diamonds', sku: 'FF-100', amount: 100, price: 0.99, sortOrder: 1 },
          { name: '310 Diamonds', sku: 'FF-310', amount: 310, price: 2.99, sortOrder: 2 },
          { name: '520 Diamonds', sku: 'FF-520', amount: 520, price: 4.99, sortOrder: 3 },
        ],
      },
    },
  });

  console.log('? ???????????????????????????!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
