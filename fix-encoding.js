const fs = require('fs');
const path = require('path');

const files = [
  'api-gateway/package.json',
  'services/auth-service/package.json',
  'services/event-service/package.json',
  'services/booking-service/package.json',
  'services/payment-service/package.json',
  'services/notification-service/package.json'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    const buffer = fs.readFileSync(fullPath);
    // Check if it has UTF-16 LE BOM (FF FE)
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
      // Decode from UTF-16LE
      const text = buffer.toString('utf16le');
      // Remove BOM if present in string
      const cleanText = text.replace(/^\uFEFF/, '');
      fs.writeFileSync(fullPath, cleanText, 'utf8');
      console.log(`Converted ${file} to UTF-8`);
    } else {
      console.log(`${file} is not UTF-16LE or already fixed`);
    }
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
  }
});
