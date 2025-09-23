const { exec } = require('child_process');

console.log('🔄 Starting training programs restore...');

const command = 'npm run restore:training-programs';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error executing restore:', error);
    return;
  }
  
  if (stderr) {
    console.error('❌ Restore stderr:', stderr);
    return;
  }
  
  console.log('✅ Restore output:');
  console.log(stdout);
});
