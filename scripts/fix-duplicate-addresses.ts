/**
 * Fix Duplicate Addresses in Database
 * Removes duplicate addresses and keeps only unique ones
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  isDefault: boolean;
  userId: string;
}

async function fixDuplicateAddresses() {
  console.log('🔍 Checking for duplicate addresses...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        addresses: true
      }
    });

    let totalDuplicatesRemoved = 0;

    for (const user of users) {
      if (user.addresses.length <= 1) {
        console.log(`✅ User ${user.email}: ${user.addresses.length} address(es) - No duplicates`);
        continue;
      }

      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Total addresses: ${user.addresses.length}`);

      // Group addresses by their content (street, city, state, zip)
      const addressMap = new Map<string, Address[]>();

      user.addresses.forEach((addr) => {
        const key = `${addr.street}|${addr.city}|${addr.state}|${addr.zip}|${addr.country}`;
        if (!addressMap.has(key)) {
          addressMap.set(key, []);
        }
        addressMap.get(key)!.push(addr);
      });

      // Find and remove duplicates
      let userDuplicatesRemoved = 0;

      for (const [key, addresses] of Array.from(addressMap.entries())) {
        if (addresses.length > 1) {
          console.log(`\n   🔴 Found ${addresses.length} duplicate addresses:`);
          console.log(`      ${addresses[0].street}, ${addresses[0].city}, ${addresses[0].state}`);

          // Keep the first one (or the default one if exists)
          const defaultAddr = addresses.find(a => a.isDefault);
          const keepAddress = defaultAddr || addresses[0];
          const duplicatesToRemove = addresses.filter(a => a.id !== keepAddress.id);

          console.log(`      ✅ Keeping: ${keepAddress.id}${keepAddress.isDefault ? ' (default)' : ''}`);
          console.log(`      ❌ Removing ${duplicatesToRemove.length} duplicate(s):`);

          for (const duplicate of duplicatesToRemove) {
            console.log(`         - ${duplicate.id}`);
            await prisma.addresses.delete({
              where: { id: duplicate.id }
            });
            userDuplicatesRemoved++;
            totalDuplicatesRemoved++;
          }
        }
      }

      if (userDuplicatesRemoved === 0) {
        console.log(`   ✅ No duplicates found`);
      } else {
        console.log(`   ✅ Removed ${userDuplicatesRemoved} duplicate(s)`);
      }

      // Show final count
      const remainingAddresses = await prisma.addresses.count({
        where: { userId: user.id }
      });
      console.log(`   📊 Final count: ${remainingAddresses} unique address(es)`);
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Cleanup complete!`);
    console.log(`   Total duplicates removed: ${totalDuplicatesRemoved}`);
    console.log('='.repeat(80));

    // Show summary
    console.log('\n📊 Summary by User:');
    const usersWithAddresses = await prisma.user.findMany({
      include: {
        addresses: true
      },
      where: {
        addresses: {
          some: {}
        }
      }
    });

    for (const user of usersWithAddresses) {
      console.log(`   ${user.email}: ${user.addresses.length} address(es)`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDuplicateAddresses();
