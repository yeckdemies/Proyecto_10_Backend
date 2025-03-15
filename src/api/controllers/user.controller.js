const User = require('../models/user.model');
const Pet = require('../models/pet.model');
const bcrypt = require('bcrypt');
const { signGenerate } = require('../../utils/jwt');
const Adoption = require('../models/adoption.model');

const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find().populate();

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User or email already exists' });
    }

    const newUser = new User({ userName, email, password, role: 'user' });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: savedUser._id,
        userName: savedUser.userName,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName: userName }).select('+password'); //debo incluir esta línea al haber añadido el select: false en el modelo

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = signGenerate(user);

    const userWithoutPassword = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error logging in', error: error.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userName, email, password, role } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const userToUpdate = await User.findOne({ userName });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!isAdmin && req.user._id.toString() !== userToUpdate._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to modify this user' });
    }

    const changes = {};

    if (email && email !== userToUpdate.email) {
      changes.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      changes.password = await bcrypt.hash(password, salt);
    }

    if (role && isAdmin && role !== userToUpdate.role) {
      changes.role = role;
    }

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    Object.assign(userToUpdate, changes);
    await userToUpdate.save();

    return res.status(200).json({
      message: 'User updated successfully',
      updatedFields: changes
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error updating user', error: error.message });
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('favourites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userName } = req.body;

    const userToDelete = await User.findOne({ userName });

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isSelf = req.user._id.toString() === userToDelete._id.toString();

    if (isSelf) {
      return res
        .status(403)
        .json({ message: 'You cannot delete your own user' });
    }

    await Adoption.deleteMany({ user: userToDelete._id });

    const userDeleted = await User.findByIdAndDelete(userToDelete._id);

    return res.status(200).json({
      message: `User '${userDeleted.userName}' and related data deleted successfully`
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error deleting user', error: error.message });
  }
};

const setFavourite = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const pet = await Pet.findById(petId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const isFavourite = user.favourites.some((fav) => fav.toString() === petId);

    if (isFavourite) {
      user.favourites = user.favourites.filter(
        (fav) => fav.toString() !== petId
      );
      await user.save();
      return res.status(200).json({ message: 'Pet removed from favourites' });
    } else {
      user.favourites.push(petId);
      await user.save();
      return res.status(200).json({ message: 'Pet added to favourites' });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error setting favourite',
      error: error.message
    });
  }
};

const removeFavourite = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const isFavourite = user.favourites.some((fav) => fav.toString() === petId);
    if (!isFavourite) {
      return res.status(400).json({ message: 'Pet is not in favourites' });
    }

    user.favourites = user.favourites.filter((fav) => fav.toString() !== petId);
    await user.save();

    return res.status(200).json({ message: 'Pet removed from favourites' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error removing favourite',
      error: error.message
    });
  }
};
const getFavourites = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      console.log('User ID not found in request.');
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    console.log('Fetching favourites for user:', userId);

    const user = await User.findById(userId).populate('favourites');

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favourites || user.favourites.length === 0) {
      console.log('User has no favourite pets.');
      return res.status(200).json({ favourites: [] });
    }

    const activeAdoptions = await Adoption.find({
      status: { $in: ['Pending', 'Approved'] }
    }).distinct('pet');

    const activeAdoptionIds = activeAdoptions.map((id) => id.toString());

    const filteredFavourites = user.favourites.filter(
      (pet) => !activeAdoptionIds.includes(pet._id.toString()) // Aseguramos comparación como string
    );

    console.log(
      'Filtered favourites:',
      filteredFavourites.map((pet) => pet._id.toString())
    );

    return res.status(200).json({ favourites: filteredFavourites });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching favourites',
      error: error.message
    });
  }
};

module.exports = {
  getAllUser,
  registerUser,
  loginUser,
  updateUser,
  getCurrentUser,
  deleteUser,
  setFavourite,
  removeFavourite,
  getFavourites
};
