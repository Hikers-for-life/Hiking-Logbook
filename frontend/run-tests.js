const { execSync } = require('child_process');

try {
  console.log('Running frontend tests with coverage...');
  execSync('npm test -- --coverage --watchAll=false --passWithNoTests', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
}
