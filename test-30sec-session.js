const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test30SecondSession() {
  console.log('🧪 Testing 30-Second Session Expiration...\n');
  
  try {
    // Check current sessions
    const sessions = await prisma.session.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { expires: 'desc' },
      take: 5
    });
    
    console.log(`📋 Current Sessions (${sessions.length} found):`);
    sessions.forEach((session, index) => {
      const now = new Date();
      const isExpired = session.expires < now;
      const timeLeft = Math.floor((session.expires - now) / 1000); // seconds
      const status = isExpired ? '🔴 EXPIRED' : '🟢 ACTIVE';
      
      console.log(`   ${index + 1}. ${status} - User: ${session.user.email}`);
      console.log(`      Expires: ${session.expires}`);
      console.log(`      Time left: ${isExpired ? 'EXPIRED' : `${timeLeft} seconds`}`);
      console.log('');
    });
    
    console.log('🔧 Test Instructions:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Login to your website');
    console.log('3. Wait exactly 30+ seconds without any activity');
    console.log('4. Try to navigate to any page or refresh');
    console.log('5. You should be redirected to login page');
    console.log('');
    
    console.log('🐛 If session expiration is NOT working:');
    console.log('- Check browser console for session validation logs');
    console.log('- Verify NextAuth is calling session callback');
    console.log('- Check if JWT tokens are being validated properly');
    console.log('- Ensure database sessions are being checked');
    
    // Monitor sessions in real-time
    console.log('🔍 Monitoring sessions for changes...');
    console.log('Press Ctrl+C to stop monitoring\n');
    
    let lastCount = sessions.length;
    setInterval(async () => {
      try {
        const currentSessions = await prisma.session.findMany({
          where: { expires: { gt: new Date() } }
        });
        
        if (currentSessions.length !== lastCount) {
          console.log(`📊 Active sessions changed: ${lastCount} → ${currentSessions.length}`);
          lastCount = currentSessions.length;
        }
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 5000); // Check every 5 seconds
    
  } catch (error) {
    console.error('❌ Error testing session:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Stopping session monitoring...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the test
test30SecondSession();
