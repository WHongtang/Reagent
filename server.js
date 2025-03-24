const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('./models/Item'); // 引入 Item 模型
const app = express();

app.use(cors());
app.use(express.json());
//链接云端
const mongoURI = 'mongodb+srv://wenkeeer:baDaQLIMA4pK0PdR@cluster0.ediqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// 初始数据
const initialItems = [
  { name: 'Initial Item 1', description: 'This is the first initial item' },
  { name: 'Initial Item 2', description: 'This is the second initial item' },
  { name: 'Initial Item 3', description: 'This is the third initial item' }
];

// 向数据库插入初始数据
mongoose.connection.once('open', async () => {
  // 插入数据前检查是否已经有数据
  const count = await Item.countDocuments();
  if (count === 0) {
    await Item.insertMany(initialItems);
    console.log('Initial data added');
  }
});

// 创建项目的路由
app.post('/items', async (req, res) => {
  const { name, description } = req.body;
  const newItem = new Item({ name, description });
  try {
    await newItem.save();
    res.send('Item created');
  } catch (err) {
    res.status(500).send('Error creating item');
  }
});

// 获取所有项目
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).send('Error retrieving items');
  }
});

// 处理根路径的请求
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
