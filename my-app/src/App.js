import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 向后端发送 GET 请求
    fetch('http://localhost:5000/items')  // 请求后端的 /items 路径
      .then(response => response.json())  // 获取响应并解析为 JSON
      .then(data => setMessage(JSON.stringify(data, null, 2))); // 将返回的数据显示出来
  }, []);  // 空数组表示仅在组件加载时执行一次

  return (
    <div>
      <h1>Items from MongoDB:</h1>
      <pre>{message}</pre>  {/* 显示从后端获取的数据 */}
    </div>
  );
}

export default App;

