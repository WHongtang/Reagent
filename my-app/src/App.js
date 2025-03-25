import React, { useEffect, useState } from 'react';
import './App.css';  // 导入样式
import { API_BASE_URL } from './config';

function App() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]); // 用于保存搜索后的数据
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    quantity: '', // 余量字段
    expiryDate: '',
    manager: '',
    remarks: ''
  });
  const [editItemId, setEditItemId] = useState(null);  // 用于追踪正在编辑的项目
  const [searchQuery, setSearchQuery] = useState(''); // 用于存储搜索框中的内容
  const [errorMessage, setErrorMessage] = useState(''); // 用于显示错误信息

  // 获取 Items 数据
  useEffect(() => {
    fetch(`${API_BASE_URL}/items`)
      .then(response => response.json())
      .then(data => {
        setItems(data);
        setFilteredItems(data);  // 初始化时显示所有数据
      })
      .catch(error => console.error('Error fetching items:', error));
  }, []);

  // 处理表单输入
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value // 更新相应字段
    });
  };

  // 处理搜索输入
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);

    // 根据搜索条件过滤数据
    const filtered = items.filter(item => {
      return (
        (item.name && item.name.toLowerCase().includes(value.toLowerCase())) ||
        (item.manager && item.manager.toLowerCase().includes(value.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(value.toLowerCase())) ||
        (item.remarks && item.remarks.toLowerCase().includes(value.toLowerCase())) ||
        (item.quantity && item.quantity.toLowerCase().includes(value.toLowerCase())) // 添加余量搜索
      );
    });

    setFilteredItems(filtered); // 更新筛选后的数据
  };

  // 格式化过期时间
  const formatDate = (date) => {
    if (!date) return '';  // 如果日期为空，返回空字符串
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // 获取日期部分，格式化为 "yyyy-mm-dd"
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const currentName = formData.name.trim();
    if (!currentName) {
      alert("试剂名称是必填项！");
      return;
    }
  
    const existingItem = items.find(item =>
      item.name.toLowerCase() === currentName.toLowerCase() && item._id !== editItemId
    );
  
    if (existingItem) {
      setErrorMessage('已存在相同名称的试剂，请修改试剂名称');
      return;
    } else {
      setErrorMessage('');
  
      const newItemRaw = {
        name: currentName,
        location: formData.location,
        quantity: formData.quantity,
        expiryDate: formData.expiryDate,
        manager: formData.manager,
        remarks: formData.remarks
      };
  
      const newItem = {};
      Object.keys(newItemRaw).forEach((key) => {
        const value = newItemRaw[key];
        if (typeof value === 'string') {
          if (value.trim() !== '') {
            newItem[key] = value.trim();
          }
        } else if (value) {
          newItem[key] = value;
        }
      });
  
      try {
        if (editItemId) {
          const response = await fetch(`${API_BASE_URL}/items/${editItemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem),
          });
  
          if (response.ok) {
            const updatedItem = await response.json();
            setItems(items.map(item => (item._id === updatedItem._id ? updatedItem : item)));
            setFilteredItems(filteredItems.map(item => (item._id === updatedItem._id ? updatedItem : item)));
            setEditItemId(null);
          }
        } else {
          const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem),
          });
  
          if (response.ok) {
            const addedItem = await response.json();
            setItems([...items, addedItem]);
            setFilteredItems([...filteredItems, addedItem]);
          } else {
            alert('添加失败：服务器返回错误状态');
          }
        }
  
        setFormData({
          name: '',
          location: '',
          quantity: '',
          expiryDate: '',
          manager: '',
          remarks: ''
        });
  
      } catch (error) {
        console.error('Error:', error);
        alert('添加失败：请检查网络或控制台错误信息');
      }
    }
  };
 

  // 编辑数据
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      location: item.location,
      quantity: item.quantity,  // 确保编辑时余量字段被填充
      expiryDate: item.expiryDate ? formatDate(item.expiryDate) : '',
      manager: item.manager,
      remarks: item.remarks
    });
    setEditItemId(item._id);
  };

  // 删除数据
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setItems(items.filter(item => item._id !== id));
          setFilteredItems(filteredItems.filter(item => item._id !== id));
        } else {
          console.error('Error deleting item');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="container">
      <h1>Items from MongoDB:</h1>

      {/* 搜索框 */}
      <input
        type="text"
        placeholder="搜索试剂名称、管理人、余量、备注..."
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {/* 显示错误信息 */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* 表单输入部分 */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="试剂名称"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="存放位置"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          type="text"
          name="quantity"
          placeholder="余量 (如：10 ml)"
          value={formData.quantity} // 确保余量显示
          onChange={handleChange}
        />
        <input
          type="date"
          name="expiryDate"
          placeholder="过期时间"
          value={formData.expiryDate}
          onChange={handleChange}
        />
        <input
          type="text"
          name="manager"
          placeholder="管理人"
          value={formData.manager}
          onChange={handleChange}
        />
        <input
          type="text"
          name="remarks"
          placeholder="备注"
          value={formData.remarks}
          onChange={handleChange}
        />
        <button type="submit">{editItemId ? '更新试剂' : '添加试剂'}</button>
      </form>

      {/* 显示表格 */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>试剂名称</th>
              <th>存放位置</th>
              <th>余量</th>
              <th>过期时间</th>
              <th>管理人</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.location || '-'}</td>
                <td>{item.quantity || '-'}</td>
                <td>{formatDate(item.expiryDate)}</td> {/* 格式化过期时间 */}
                <td>{item.manager || '-'}</td>
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
