const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('./models/Item'); // 引入 Item 模型
const app = express();

app.use(cors());
app.use(express.json());

// 链接云端 MongoDB
const mongoURI = 'mongodb+srv://wenkeeer:baDaQLIMA4pK0PdR@cluster0.ediqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// 初始数据
const initialItems = [
  { name: 'AgNW', description: 'This is the first initial item' },
  { name: 'Initial Item 2', description: 'This is the second initial item' },
  { name: 'Initial Item 3', description: 'This is the third initial item' }
];

// 向数据库插入初始数据
mongoose.connection.once('open', async () => {
  // 插入数据前检查是否已经有数据
  const count = await Item.countDocuments();

  // 如果数据库中没有数据，则插入初始数据
  if (count === 0) {
    await Item.insertMany(initialItems);
    console.log('Initial data added');
  } else {
    // 如果数据库已有数据，则不插入重复的数据
    for (const item of initialItems) {
      const existingItem = await Item.findOne({ name: item.name });
      if (!existingItem) {
        await Item.create(item);
        console.log(`Item ${item.name} added`);
      }
    }
  }
});

// 创建项目的路由 (POST)
app.post('/items', async (req, res) => {
  const { name, description, location, quantity, expiryDate, manager, remarks } = req.body;

  // 检查必填字段（试剂名称）
  if (!name) {
    return res.status(400).send('试剂名称是必填项');
  }

  // 创建新试剂
  const newItem = new Item({
    name,
    description,
    location,
    quantity,  // 余量字段
    expiryDate,
    manager,
    remarks
  });

  try {
    await newItem.save();
    res.status(201).json(newItem);  // 返回新添加的试剂数据
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating item');
  }
});

// 更新项目的路由 (PUT)
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, location, quantity, expiryDate, manager, remarks } = req.body;

  // 检查必填字段（试剂名称）
  if (!name) {
    return res.status(400).send('试剂名称是必填项');
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(id, {
      name,
      description,
      location,
      quantity,  // 余量字段
      expiryDate,
      manager,
      remarks
    }, { new: true });  // 返回更新后的文档

    if (!updatedItem) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(updatedItem);  // 返回更新后的项目
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating item');
  }
});


// 删除项目的路由 (DELETE)
app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).send('Item not found');
    }

    res.status(200).send('Item deleted');  // 返回成功删除的消息
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting item');
  }
});


// 获取所有项目并支持搜索功能
app.get('/items', async (req, res) => {
  const { search } = req.query;  // 获取查询参数

  // 构造查询过滤条件
  const filter = search ? {
    $or: [
      { name: { $regex: search, $options: 'i' } },  // 模糊查询试剂名称
      { manager: { $regex: search, $options: 'i' } },  // 模糊查询管理人
      { location: { $regex: search, $options: 'i' } },  // 模糊查询存放位置
      { remarks: { $regex: search, $options: 'i' } },  // 模糊查询备注
    ]
  } : {};

  try {
    // 使用 MongoDB 查找符合条件的数据，并按名称升序排序
    const items = await Item.find(filter).sort({ name: 1 });
    res.json(items);  // 返回查询到的项目
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving items');
  }
});



// 处理根路径的请求
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// 启动服务器
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
