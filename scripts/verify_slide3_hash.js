const bcrypt = require('bcryptjs');

const p = 'Admin@123';
const h = '$2a$10$vai4GLhOgTziiaw2$2a$10$vai4GLhOgTziiaw2wLHS6.w0wGmAROUI5t63S2NSrRTppA8vxpoPq'; // Wait, let me copy carefully from slide 3

// Slide 3 hash screenshot copy:
// $2a$10$vai4GLhOgTziiaw2wLHS6.w0wGmAROUI5t63S2NSrRTppA8vxpoPq
const trueHash = '$2a$10$vai4GLhOgTziiaw2wLHS6.w0wGmAROUI5t63S2NSrRTppA8vxpoPq';

bcrypt.compare(p, trueHash).then(res => {
  console.log('Match:', res);
});
