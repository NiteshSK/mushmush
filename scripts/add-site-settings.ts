import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating SiteSettings table...');

  try {
    // Check if SiteSettings table exists by trying to query it
    await prisma.siteSettings.findFirst();
    console.log('SiteSettings table already exists.');
  } catch (error) {
    console.log('SiteSettings table does not exist, creating it...');
    
    // Create the table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        enable_festive_effects BOOLEAN DEFAULT false,
        festive_effects_start_date TIMESTAMP,
        festive_effects_end_date TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('SiteSettings table created successfully.');
  }

  // Insert default settings if no settings exist
  const existingSettings = await prisma.$queryRaw`
    SELECT * FROM site_settings LIMIT 1
  ` as any[];

  if (existingSettings.length === 0) {
    console.log('Inserting default site settings...');
    await prisma.$executeRaw`
      INSERT INTO site_settings (enable_festive_effects, created_at, updated_at)
      VALUES (false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    console.log('Default site settings inserted.');
  } else {
    console.log('Site settings already exist.');
  }

  console.log('SiteSettings setup completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
