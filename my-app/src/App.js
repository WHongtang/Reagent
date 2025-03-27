import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { API_BASE_URL } from './config';

function App() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '', location: '', quantity: '', expiryDate: '', manager: '', cas: '', link: '', remarks: ''
  });
  const [editItemId, setEditItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: localStorage.getItem('savedUsername') || '',
    password: localStorage.getItem('savedPassword') || '',
    remember: localStorage.getItem('rememberMe') === 'true'
  });
  const formRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ping`)
      .then(res => res.text())
      .then(data => {
        if (data === 'pong') setBackendReady(true);
      })
      .catch(err => console.error('❌ 后端未响应:', err));
  }, []);

  useEffect(() => {
    if (!backendReady || !authenticated) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setFilteredItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ 获取失败:', err);
        setLoading(false);
      });
  }, [backendReady, authenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const filtered = items.filter(item =>
      ['name', 'manager', 'location', 'cas', 'remarks', 'quantity', 'link'].some(key =>
        item[key]?.toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredItems(filtered);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('试剂名称是必填项');
    if (submitting) return;

    setSubmitting(true);
    setErrorMessage('');

    const url = editItemId ? `${API_BASE_URL}/items/${editItemId}` : `${API_BASE_URL}/items`;
    const method = editItemId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.status === 409) {
        setErrorMessage('已存在同名试剂，请修改名称');
      } else if (!response.ok) {
        throw new Error('提交失败');
      } else {
        const result = await response.json();
        const updatedList = editItemId
          ? items.map(item => item._id === result._id ? result : item)
          : [...items, result];
        setItems(updatedList);
        setFilteredItems(updatedList);
        setEditItemId(null);
        setFormData({ name: '', location: '', quantity: '', expiryDate: '', manager: '', cas: '', link: '', remarks: '' });
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      alert('提交失败，请检查网络或控制台错误');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      location: item.location || '',
      quantity: item.quantity || '',
      expiryDate: item.expiryDate ? formatDate(item.expiryDate) : '',
      manager: item.manager || '',
      cas: item.cas || '',
      link: item.link || '',
      remarks: item.remarks || ''
    });
    setEditItemId(item._id);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确认删除此试剂吗？')) return;
    try {
      await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE' });
      const updated = items.filter(item => item._id !== id);
      setItems(updated);
      setFilteredItems(updated);
    } catch (err) {
      alert('删除失败');
      console.error(err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === '429' && loginForm.password === '429') {
      setAuthenticated(true);
      if (loginForm.remember) {
        localStorage.setItem('savedUsername', loginForm.username);
        localStorage.setItem('savedPassword', loginForm.password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('rememberMe');
      }
    } else {
      alert('账号或密码错误');
    }
  };

  if (!authenticated) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '10px' }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', backgroundColor: 'white', alignItems: 'center' }}>
          <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>登录</h2>
          <input type="text" name="username" placeholder="用户名" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required style={{ padding: '10px', fontSize: '16px', width: '100%' }} />
          <input type="password" name="password" placeholder="密码" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required style={{ padding: '10px', fontSize: '16px', width: '100%' }} />
          <label style={{ fontSize: '14px', alignSelf: 'flex-start' }}>
            <input type="checkbox" checked={loginForm.remember} onChange={e => setLoginForm({ ...loginForm, remember: e.target.checked })} style={{ marginRight: '5px' }} />
            记住密码
          </label>
          <button type="submit" style={{ padding: '10px', fontSize: '16px', width: '100%' }}>登录</button>
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#666', textAlign: 'center' }}>在小小的429里挖呀挖呀挖</div>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '50px', paddingLeft: '40px', paddingRight: '40px' }}>
      <h1>试剂管理系统</h1>

      {!backendReady ? <p>🔄 正在连接服务器...</p> : loading ? <p>⏳ 数据加载中...</p> : null}

      <input type="text" placeholder="搜索试剂名称、管理人、CAS码、备注、链接..." value={searchQuery} onChange={handleSearchChange} />

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form
  onSubmit={handleSubmit}
  ref={formRef}
  className="main-form"
>

  {/* 第一行：5个输入框 */}
  <input type="text" name="name" placeholder="试剂名称（必填）" value={formData.name} onChange={handleChange} required style={{ width: '100%' }} />
  <input type="text" name="location" placeholder="存放位置" value={formData.location} onChange={handleChange} style={{ width: '100%' }} />
  <input type="text" name="quantity" placeholder="余量 (如 10ml)" value={formData.quantity} onChange={handleChange} style={{ width: '100%' }} />
  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={{ width: '100%' }} />
  <input type="text" name="manager" placeholder="管理人" value={formData.manager} onChange={handleChange} style={{ width: '100%' }} />

  {/* 第二行：3个输入框 + 按钮 */}
  <input type="text" name="cas" placeholder="CAS码" value={formData.cas} onChange={handleChange} style={{ width: '100%' }} />
  <input type="text" name="link" placeholder="购买链接" value={formData.link} onChange={handleChange} style={{ width: '100%' }} />
  <input type="text" name="remarks" placeholder="备注" value={formData.remarks} onChange={handleChange} style={{ width: '100%' }} />
  <button
    type="submit"
    disabled={submitting}
    style={{ width: '100%', height: '40px', fontSize: '16px' }}
  >
    {submitting ? '处理中...' : (editItemId ? '更新试剂' : '添加试剂')}
  </button>
</form>


      <div className="table-container" style={{ marginTop: '40px', marginBottom: '80px' }}>
        <table style={{ width: '100%', minWidth: '800px' }}>
          <thead>
            <tr>
              <th>名称</th><th>位置</th><th>余量</th><th>过期</th><th>管理人</th><th>CAS码</th><th>购买链接</th><th>备注</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.location || '-'}</td>
                <td>{item.quantity || '-'}</td>
                <td>{formatDate(item.expiryDate)}</td>
                <td>{item.manager || '-'}</td>
                <td>{item.cas || '-'}</td>
                <td>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a> : '-'}</td>
                <td>{item.remarks || '-'}</td>
                <td>
  <button onClick={() => handleEdit(item)}>编辑</button>
  <button onClick={() => handleDelete(item._id)}>删除</button>
</td>



              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
