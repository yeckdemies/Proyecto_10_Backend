const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'pets',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    adoptionDate: {
      type: Date,
      default: Date.now
    },
    comments: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'adoptions'
  }
);

const Adoption = mongoose.model('adoptions', adoptionSchema, 'adoptions');

module.exports = Adoption;
