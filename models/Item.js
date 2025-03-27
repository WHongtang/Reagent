const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  quantity: { type: String },
  expiryDate: { type: Date },
  manager: { type: String },
  cas: { type: String },
  link: { type: String },
  remarks: { type: String }
});

module.exports = mongoose.model('Item', itemSchema);
