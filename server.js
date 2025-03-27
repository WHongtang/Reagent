const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('./models/Item');

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://wenkeeer:baDaQLIMA4pK0PdR@cluster0.ediqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// ✅ 添加试剂（含购买链接 link 字段）
app.post('/items', async (req, res) => {
  console.log('✅ 收到 POST 数据:', req.body);
  const { name, location, quantity, expiryDate, manager, cas, remarks, link } = req.body;

  if (!name) return res.status(400).send('试剂名称是必填项');

  try {
    const exists = await Item.findOne({ name });
    if (exists) return res.status(409).send('❌ 已存在同名试剂');

    const newItem = new Item({ name, location, quantity, expiryDate, manager, cas, remarks, link }); // ✅ 加上 link
    console.log('📦 即将保存的 newItem:', newItem);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('❌ 保存失败:', err);
    res.status(500).send('Error creating item');
  }
});

// ✅ 更新试剂（含 link 字段）
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, quantity, expiryDate, manager, cas, remarks, link } = req.body;

  if (!name) return res.status(400).send('试剂名称是必填项');

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, location, quantity, expiryDate, manager, cas, remarks, link }, // ✅ 加上 link
      { new: true }
    );
    if (!updatedItem) return res.status(404).send('Item not found');
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error('❌ 更新失败:', err);
    res.status(500).send('Error updating item');
  }
});

app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).send('Item not found');
    res.status(200).send('Item deleted');
  } catch (err) {
    console.error('❌ 删除失败:', err);
    res.status(500).send('Error deleting item');
  }
});

app.get('/items', async (req, res) => {
  const { search } = req.query;
  const filter = search ? {
    $or: [
      { name: new RegExp(search, 'i') },
      { manager: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') },
      { cas: new RegExp(search, 'i') },
      { remarks: new RegExp(search, 'i') },
      { link: new RegExp(search, 'i') }, // ✅ 支持购买链接搜索
    ]
  } : {};

  try {
    const items = await Item.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    console.error('❌ 获取失败:', err);
    res.status(500).send('Error retrieving items');
  }
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
