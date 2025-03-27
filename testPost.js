const fetch = require('node-fetch'); // 安装：npm install node-fetch@2

fetch('http://localhost:5000/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '乙醇',
    cas: '64-17-5',
    location: '冰箱',
    quantity: '100ml',
    expiryDate: '2025-12-31',
    manager: '张三',
    remarks: '测试数据'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ 成功写入数据库:', data);
  })
  .catch(err => {
    console.error('❌ 失败:', err);
  });
