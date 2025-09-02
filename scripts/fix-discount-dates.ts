import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDiscountDates() {
  try {
    console.log('🔧 Fixing discount dates...\n');
    
    // Set end date to 1 year from now for all active discounts
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    const result = await prisma.productDiscount.updateMany({
      where: {
        isActive: true,
        endDate: null
      },
      data: {
        endDate: oneYearFromNow
      }
    });

    console.log(`✅ Updated ${result.count} discount records with proper end dates`);
    console.log(`📅 End date set to: ${oneYearFromNow}`);

    // Verify the fix
    const discounts = await prisma.productDiscount.findMany({
      where: {
        isActive: true
      },
      include: {
        product: {
          select: {
            title: true
          }
        }
      }
    });

    console.log('\n📊 Updated discount records:');
    discounts.forEach(discount => {
      const isValid = discount.startDate <= new Date() && (discount.endDate ? discount.endDate >= new Date() : false);
      console.log(`  ${discount.product.title}: ${discount.value}% (Valid: ${isValid})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDiscountDates();
