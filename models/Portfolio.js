const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    images: { type: String }, // Single field for images (comma-separated for multiple images)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

portfolioSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
