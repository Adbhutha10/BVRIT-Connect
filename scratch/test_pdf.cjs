const pdf = require('./backend/node_modules/pdf-parse');
console.log('Type:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
if (pdf.default) {
    console.log('Default Type:', typeof pdf.default);
}
