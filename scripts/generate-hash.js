const bcrypt = require('bcrypt');

// Generate hash for password "password"
bcrypt.hash('password', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log(`Password hash for "password": ${hash}`);
  console.log('\nUse this hash in the SQL script:');
  console.log(`UPDATE admins SET password = '${hash}' WHERE email = 'admin@greensparkuni.edu.ng';`);
});
