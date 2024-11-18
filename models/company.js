const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  founded: { type: Number, required: true },  // Year the company was founded
  headquarters: { type: String, required: true },
  stockSymbol: { type: String, required: true },  // For financial API use
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema);