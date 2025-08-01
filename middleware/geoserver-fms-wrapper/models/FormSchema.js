const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  featureID: { type: String, required: true, unique: true },
  formData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormSchema', FormSchema);
