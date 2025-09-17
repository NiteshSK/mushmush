import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creating test user...')

  const hashedPassword = await hash('password123', 12)

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  })

  console.log('✅ Test user created:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  console.log('🔑 You can now login with:')
  console.log('   Email: test@example.com')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error creating test user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
