const mongoose = require('mongoose');

// 定义 Item 模型
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

// 创建模型并导出
const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;
