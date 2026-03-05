// Setup PINs for tables 1, 2, and 3
localStorage.setItem('table_passwords', JSON.stringify({
  '1': '123',
  '2': '456', 
  '3': '789'
}));

console.log('PINs set: Table 1=123, Table 2=456, Table 3=789');
console.log('Tables 4, 5, 6 have no PINs');
