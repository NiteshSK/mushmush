const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRegistrationStatus() {
  try {
    // Find the specific registration by registration number
    const registration = await prisma.trainingRegistration.findUnique({
      where: {
        registrationNumber: 'TR1758126843644951'
      },
      include: {
        trainingProgram: true,
        user: true
      }
    });

    if (!registration) {
      console.log('Registration TR1758126843644951 not found');
      return;
    }

    console.log('Current registration status:');
    console.log('- Registration Number:', registration.registrationNumber);
    console.log('- Status:', registration.status);
    console.log('- Payment Status:', registration.paymentStatus);
    console.log('- Payment Method:', registration.paymentMethod);
    console.log('- UPI Transaction ID:', registration.upiTransactionId);
    console.log('- Payment Date:', registration.paymentDate);
    console.log('- Program:', registration.trainingProgram.name);
    console.log('- Participant:', registration.participantName);
    console.log('- Email:', registration.participantEmail);

    // Check if payment details exist (indicating payment was made)
    if (registration.paymentMethod && registration.upiTransactionId && registration.paymentDate) {
      console.log('\nPayment details found. Updating status to CONFIRMED...');
      
      const updatedRegistration = await prisma.trainingRegistration.update({
        where: { id: registration.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED' // Also mark payment as completed
        },
        include: {
          trainingProgram: true,
          user: true
        }
      });

      console.log('\n✅ Registration updated successfully!');
      console.log('- New Status:', updatedRegistration.status);
      console.log('- New Payment Status:', updatedRegistration.paymentStatus);
      console.log('- Updated At:', updatedRegistration.updatedAt);
    } else {
      console.log('\n❌ No payment details found. Registration remains in current status.');
      console.log('Please ensure payment has been submitted before updating status.');
    }
  } catch (error) {
    console.error('Error updating registration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRegistrationStatus();
