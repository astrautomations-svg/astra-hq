const fs = require('fs');
const file = 'pages/_document.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '<meta name="theme-color" content="#04060e"/>',
  '<meta name="theme-color" content="#05080f"/>\n        <link rel="manifest" href="/manifest.json"/>\n        <link rel="apple-touch-icon" href="/astra-icon-192.png"/>\n        <meta name="apple-mobile-web-app-capable" content="yes"/>\n        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>\n        <meta name="apple-mobile-web-app-title" content="Astra HQ"/>'
);
fs.writeFileSync(file, content, 'utf8');
console.log('Done');
