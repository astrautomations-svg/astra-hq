const fs = require('fs');
const file = 'pages/index.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('<div style={{ flexShrink:0 }}>', '<div style={{ flexShrink:0, mixBlendMode:"screen" }}>');
fs.writeFileSync(file, content, 'utf8');
console.log('Reemplazos:', (content.match(/mixBlendMode/g) || []).length);
