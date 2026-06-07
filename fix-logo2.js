const fs = require('fs');
const path = require('path');

const imgPath = path.join(process.env.USERPROFILE, 'Downloads', 'icon-192.png');
const imgData = fs.readFileSync(imgPath);
const b64 = imgData.toString('base64');
const newSrc = 'data:image/png;base64,' + b64;

const file = 'pages/index.js';
let content = fs.readFileSync(file, 'utf8');
const before = content.length;
content = content.replace(/const LOGO_SRC = "data:image\/[a-z]+;base64,[^"]*"/, 'const LOGO_SRC = "' + newSrc + '"');
fs.writeFileSync(file, content, 'utf8');
console.log('Antes:', before, 'Despues:', content.length);
