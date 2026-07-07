const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Create Default Admin User
  // We check if the admin already exists to prevent duplicate errors on re-seeding
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@12345', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
      }
    });
    console.log('✅ Default Admin created: admin | Admin@12345');
  } else {
    console.log('ℹ️ Admin user already exists. Skipping.');
  }

  // 2. Create Default Device Categories
  const categories = [
    { name: 'Desktop Computer', description: 'Standard office workstations' },
    { name: 'Laptop', description: 'Portable computers' },
    { name: 'Printer', description: 'Network and local printers' },
    { name: 'Photocopier', description: 'Heavy duty copiers' },
    { name: 'Scanner', description: 'Document scanners' },
    { name: 'UPS', description: 'Uninterruptible Power Supplies' },
    { name: 'Router', description: 'Network routers' },
    { name: 'Switch', description: 'Network switches' },
    { name: 'Firewall', description: 'Security appliances' },
    { name: 'Server', description: 'Rack and tower servers' },
    { name: 'NAS', description: 'Network Attached Storage' },
    { name: 'Monitor', description: 'Display screens' },
    { name: 'Projector', description: 'Meeting room projectors' },
    { name: 'IP Phone', description: 'VoIP telephones' },
    { name: 'Barcode Scanner', description: 'Handheld barcode readers' },
    { name: 'Fingerprint Device', description: 'Biometric attendance devices' },
    { name: 'CCTV Camera', description: 'Security cameras' }
  ];

  for (const cat of categories) {
    await prisma.deviceCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Default Device Categories seeded.`);

  // 3. Create a Default Department (Optional, but good for initial testing)
  const defaultDept = await prisma.department.upsert({
    where: { name: 'IT Department' },
    update: {},
    create: {
      name: 'IT Department',
      rooms: {
        create: [
          { name: 'Server Room', floor: '1st Floor', building: 'Main HQ' },
          { name: 'IT Helpdesk', floor: '1st Floor', building: 'Main HQ' }
        ]
      }
    }
  });
  console.log(`✅ Default Department 'IT Department' seeded with rooms.`);

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
