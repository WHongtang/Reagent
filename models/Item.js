const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  location: { type: String, required: false },
  quantity: { type: String, required: false }, // 修改为 String 类型以支持数字和单位
  expiryDate: { type: Date, required: false },
  manager: { type: String, required: false },
  remarks: { type: String, required: false }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;


