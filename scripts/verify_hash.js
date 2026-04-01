const bcrypt = require('bcryptjs');

const password = 'Admin@123';
const hash = '$2a$10$vai4GLhOgTziiaw2wLHS6.w0wGmAROUI5t63S2NSrRTppA8vxpoPq';

bcrypt.compare(password, hash).then(res => {
  console.log('Match:', res);
});
