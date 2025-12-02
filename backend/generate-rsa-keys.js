const crypto = require('crypto');
const fs = require('fs');

// 生成2048位RSA密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// 保存到文件
fs.writeFileSync('rsa_private_key.pem', privateKey);
fs.writeFileSync('rsa_public_key.pem', publicKey);

console.log('RSA密钥对生成成功！');
console.log('\n=== 公钥内容（复制到Ping++控制台）===');
console.log(publicKey);
console.log('=== 公钥内容结束 ===\n');
