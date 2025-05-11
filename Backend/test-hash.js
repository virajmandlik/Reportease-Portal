const md5 = require('md5');

console.log('Testing login password hash:');
console.log('Password: Viraj@12345');
console.log('MD5 Hash:', md5('Viraj@12345')); 