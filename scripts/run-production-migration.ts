import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function runProductionMigration() {
  try {
    console.log('🚀 Running production migration for ProductDiscount table...')
    
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'manual-discount-migration.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL commands (simple approach)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📝 Found ${commands.length} SQL commands to execute`)
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command) {
        console.log(`⚡ Executing command ${i + 1}/${commands.length}`)
        await prisma.$executeRawUnsafe(command)
      }
    }
    
    console.log('✅ Production migration completed successfully!')
    console.log('🎉 ProductDiscount table is now available in production')
    
    // Verify the table was created
    const discountCount = await prisma.productDiscount.count()
    console.log(`📊 ProductDiscount table has ${discountCount} records`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    // Check if table already exists
    try {
      const count = await prisma.productDiscount.count()
      console.log('ℹ️ ProductDiscount table already exists with', count, 'records')
    } catch (e) {
      console.log('💡 Table does not exist yet')
    }
  } finally {
    await prisma.$disconnect()
  }
}

runProductionMigration()
