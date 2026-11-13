const fs = require('fs');
const qrcode = require('./qrcode.min.js');
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

// extract the exact builder code that ships in the page
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/\/\/ <<PAYLOAD_BUILDERS([\s\S]*?)\/\/ PAYLOAD_BUILDERS>>/);
if (!m) { console.error('BUILDERS BLOCK NOT FOUND'); process.exit(1); }
const api = new Function(m[1] + '; return {buildUpi,buildWifi,buildLink,buildText,stripTracking,isValidVpa,wifiEscape};')();
const {buildUpi, buildWifi, buildLink, buildText, isValidVpa} = api;

let fails = 0;
function eq(name, got, want) {
  const ok = got === want;
  if (!ok) { fails++; console.log(`FAIL ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
  else console.log(`ok   ${name}`);
}

// ---- UPI ----
eq('upi full', buildUpi({vpa:'sid@okhdfcbank', name:'Siddhant Neekhra', amount:'250', note:'Chai & samosa'}),
   'upi://pay?pa=sid%40okhdfcbank&pn=Siddhant%20Neekhra&am=250.00&cu=INR&tn=Chai%20%26%20samosa');
eq('upi no amount', buildUpi({vpa:'sid@okhdfcbank', name:'S', amount:'', note:''}),
   'upi://pay?pa=sid%40okhdfcbank&pn=S&cu=INR');
eq('upi zero amount dropped', buildUpi({vpa:'a@b', amount:'0'}), 'upi://pay?pa=a%40b&cu=INR');
eq('upi amount rounded', buildUpi({vpa:'a@b', amount:'10.5'}), 'upi://pay?pa=a%40b&am=10.50&cu=INR');
eq('upi empty vpa', buildUpi({vpa:'  '}), '');
eq('upi unicode name', buildUpi({vpa:'a@b', name:'सिद्धांत'}),
   'upi://pay?pa=a%40b&pn=%E0%A4%B8%E0%A4%BF%E0%A4%A6%E0%A5%8D%E0%A4%A7%E0%A4%BE%E0%A4%82%E0%A4%A4&cu=INR');

// ---- VPA validation ----
eq('vpa valid', isValidVpa('sid.the-hacker_07@okhdfcbank'), true);
eq('vpa missing @', isValidVpa('sidokhdfcbank'), false);
eq('vpa bad handle', isValidVpa('sid@123'), false);
eq('vpa spaces', isValidVpa('sid @okhdfcbank'), false);

// ---- Wi-Fi ----
eq('wifi escaping', buildWifi({ssid:'Home;Net', password:'pa:ss"word', security:'WPA', hidden:true}),
   'WIFI:T:WPA;S:Home\\;Net;P:pa\\:ss\\"word;H:true;;');
eq('wifi open', buildWifi({ssid:'Cafe', security:'nopass'}), 'WIFI:T:nopass;S:Cafe;;');
eq('wifi backslash', buildWifi({ssid:'a\\b', password:'x', security:'WPA'}),
   'WIFI:T:WPA;S:a\\\\b;P:x;;');
eq('wifi empty ssid', buildWifi({ssid:'', password:'x'}), '');

// ---- Links ----
eq('strip utm', buildLink({url:'https://example.com/p?utm_source=x&id=5&fbclid=abc', strip:true}).text,
   'https://example.com/p?id=5');
eq('strip count', buildLink({url:'https://example.com/?utm_source=x&fbclid=y', strip:true}).removed.length, 2);
eq('strip keeps real params', buildLink({url:'https://shop.in/item?ref=friend&color=red', strip:true}).text,
   'https://shop.in/item?color=red');
eq('strip off', buildLink({url:'https://example.com/?utm_source=x', strip:false}).text,
   'https://example.com/?utm_source=x');
eq('scheme kept', buildLink({url:'example.com/a?utm_medium=mail', strip:true}).text, 'https://example.com/a');
eq('garbage url untouched', buildLink({url:'not a url at all', strip:true}).text, 'not a url at all');
eq('empty link', buildLink({url:'', strip:true}).text, '');

// ---- Text ----
eq('text passthrough', buildText({text:'  hello  '}), '  hello  ');

// ---- QR encoding + matrix dump for decode test ----
const cases = [
  ['upi', buildUpi({vpa:'sid@okhdfcbank', name:'Siddhant Neekhra', amount:'250', note:'Chai & samosa'})],
  ['upi-unicode', buildUpi({vpa:'sid@okhdfcbank', name:'सिद्धांत नीखरा', amount:'1200', note:'किराया'})],
  ['wifi', buildWifi({ssid:'Home;Net', password:'pa:ss"word', security:'WPA', hidden:false})],
  ['link', buildLink({url:'https://example.com/p?utm_source=x&id=5&fbclid=abc', strip:true}).text],
  ['text', 'नमस्ते दुनिया — QR Studio test'],
  ['text-long', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(4)]
];
const out = [];
for (const [name, text] of cases) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const rows = [];
  for (let r = 0; r < n; r++) { let s = ''; for (let c = 0; c < n; c++) s += qr.isDark(r, c) ? '1' : '0'; rows.push(s); }
  out.push({name, text, count: n, rows});
}
fs.writeFileSync('cases.json', JSON.stringify(out, null, 1));

// capacity error path
let threw = false;
try { const q = qrcode(0, 'H'); q.addData('x'.repeat(5000)); q.make(); } catch (e) { threw = true; }
eq('over-capacity throws', threw, true);

console.log(fails === 0 ? '\nALL BUILDER TESTS PASSED' : `\n${fails} FAILURE(S)`);
process.exit(fails ? 1 : 0);
