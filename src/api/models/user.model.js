const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false //de esta manera evito que la contraseña se muestre en las consultas
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    favourites: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'pets',
        required: false
      }
    ],
    role: {
      type: String,
      required: true,
      default: 'user',
      enum: ['admin', 'user']
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('users', userSchema, 'users');

module.exports = User;
