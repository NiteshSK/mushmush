import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Indian pincode ranges by region
// Source: Kosvana is in Herbertpur, Dehradun - 248142
//
// Pricing model:
//   Total shipping = ₹50 (base) + zone baseFee (extra for distance)
//   Free shipping on orders >= ₹1999 (handled in API, not per-zone)
//
// baseFee here = EXTRA fee on top of the ₹50 base
const shippingZones = [
  // Local - Dehradun district (~50km radius) — just the ₹50 base, no extra
  {
    name: 'Local Dehradun',
    pincodeFrom: '248001',
    pincodeTo: '249999',
    baseFee: 0,
    freeAbove: null,
    estimatedDays: '1-2 days',
    priority: 10,
  },
  // Uttarakhand (rest of state)
  {
    name: 'Uttarakhand',
    pincodeFrom: '244001',
    pincodeTo: '263999',
    baseFee: 20,
    freeAbove: null,
    estimatedDays: '2-3 days',
    priority: 5,
  },
  // Delhi NCR
  {
    name: 'Delhi NCR',
    pincodeFrom: '110001',
    pincodeTo: '110999',
    baseFee: 30,
    freeAbove: null,
    estimatedDays: '2-4 days',
    priority: 3,
  },
  // Haryana
  {
    name: 'Haryana',
    pincodeFrom: '121001',
    pincodeTo: '136999',
    baseFee: 30,
    freeAbove: null,
    estimatedDays: '3-4 days',
    priority: 2,
  },
  // Uttar Pradesh
  {
    name: 'Uttar Pradesh',
    pincodeFrom: '201001',
    pincodeTo: '285999',
    baseFee: 40,
    freeAbove: null,
    estimatedDays: '3-5 days',
    priority: 2,
  },
  // Punjab
  {
    name: 'Punjab',
    pincodeFrom: '140001',
    pincodeTo: '160999',
    baseFee: 40,
    freeAbove: null,
    estimatedDays: '3-5 days',
    priority: 2,
  },
  // Himachal Pradesh
  {
    name: 'Himachal Pradesh',
    pincodeFrom: '171001',
    pincodeTo: '177999',
    baseFee: 30,
    freeAbove: null,
    estimatedDays: '3-5 days',
    priority: 2,
  },
  // Rajasthan
  {
    name: 'Rajasthan',
    pincodeFrom: '301001',
    pincodeTo: '345999',
    baseFee: 50,
    freeAbove: null,
    estimatedDays: '4-6 days',
    priority: 1,
  },
  // Madhya Pradesh
  {
    name: 'Madhya Pradesh',
    pincodeFrom: '450001',
    pincodeTo: '488999',
    baseFee: 50,
    freeAbove: null,
    estimatedDays: '4-6 days',
    priority: 1,
  },
  // Gujarat
  {
    name: 'Gujarat',
    pincodeFrom: '360001',
    pincodeTo: '396999',
    baseFee: 60,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Maharashtra
  {
    name: 'Maharashtra',
    pincodeFrom: '400001',
    pincodeTo: '445999',
    baseFee: 60,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Bihar
  {
    name: 'Bihar',
    pincodeFrom: '800001',
    pincodeTo: '855999',
    baseFee: 50,
    freeAbove: null,
    estimatedDays: '4-6 days',
    priority: 1,
  },
  // West Bengal
  {
    name: 'West Bengal',
    pincodeFrom: '700001',
    pincodeTo: '743999',
    baseFee: 60,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Karnataka
  {
    name: 'Karnataka',
    pincodeFrom: '560001',
    pincodeTo: '591999',
    baseFee: 70,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Tamil Nadu
  {
    name: 'Tamil Nadu',
    pincodeFrom: '600001',
    pincodeTo: '643999',
    baseFee: 70,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Kerala
  {
    name: 'Kerala',
    pincodeFrom: '670001',
    pincodeTo: '695999',
    baseFee: 80,
    freeAbove: null,
    estimatedDays: '6-8 days',
    priority: 1,
  },
  // Telangana & Andhra Pradesh
  {
    name: 'Telangana & Andhra Pradesh',
    pincodeFrom: '500001',
    pincodeTo: '535999',
    baseFee: 70,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Odisha
  {
    name: 'Odisha',
    pincodeFrom: '751001',
    pincodeTo: '770999',
    baseFee: 60,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Jharkhand
  {
    name: 'Jharkhand',
    pincodeFrom: '825001',
    pincodeTo: '835999',
    baseFee: 50,
    freeAbove: null,
    estimatedDays: '4-6 days',
    priority: 1,
  },
  // Chhattisgarh
  {
    name: 'Chhattisgarh',
    pincodeFrom: '490001',
    pincodeTo: '497999',
    baseFee: 60,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Goa
  {
    name: 'Goa',
    pincodeFrom: '403001',
    pincodeTo: '403999',
    baseFee: 70,
    freeAbove: null,
    estimatedDays: '5-7 days',
    priority: 1,
  },
  // Assam
  {
    name: 'Assam',
    pincodeFrom: '781001',
    pincodeTo: '788999',
    baseFee: 90,
    freeAbove: null,
    estimatedDays: '7-10 days',
    priority: 1,
  },
  // Northeast India (Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal, Sikkim)
  {
    name: 'Northeast India',
    pincodeFrom: '790001',
    pincodeTo: '799999',
    baseFee: 100,
    freeAbove: null,
    estimatedDays: '7-10 days',
    priority: 1,
  },
  // Jammu & Kashmir
  {
    name: 'Jammu & Kashmir',
    pincodeFrom: '180001',
    pincodeTo: '194999',
    baseFee: 70,
    freeAbove: null,
    estimatedDays: '5-8 days',
    priority: 1,
  },
  // Chandigarh
  {
    name: 'Chandigarh',
    pincodeFrom: '160001',
    pincodeTo: '160999',
    baseFee: 30,
    freeAbove: null,
    estimatedDays: '3-4 days',
    priority: 2,
  },
];

async function main() {
  console.log('Seeding shipping zones...');
  console.log('Model: ₹50 base + zone extra fee. Free shipping on orders ≥ ₹1999.\n');

  for (const zone of shippingZones) {
    const existing = await prisma.shippingZone.findFirst({
      where: {
        pincodeFrom: zone.pincodeFrom,
        pincodeTo: zone.pincodeTo,
      },
    });

    if (existing) {
      await prisma.shippingZone.update({
        where: { id: existing.id },
        data: zone,
      });
      console.log(`  Updated: ${zone.name} (${zone.pincodeFrom}-${zone.pincodeTo}) → ₹${50 + zone.baseFee} total`);
    } else {
      await prisma.shippingZone.create({ data: zone });
      console.log(`  Created: ${zone.name} (${zone.pincodeFrom}-${zone.pincodeTo}) → ₹${50 + zone.baseFee} total`);
    }
  }

  console.log(`\nDone! ${shippingZones.length} shipping zones seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
