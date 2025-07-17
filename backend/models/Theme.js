const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  image:       { type: String, required: true },                             // URL or filename
  color:       { type: String, required: true },                             // e.g. hex code
  description: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Theme', themeSchema);
