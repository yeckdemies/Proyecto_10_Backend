const mongoose = require('mongoose');
const Adoption = require('../models/adoption.model');
const Pet = require('../models/pet.model');

const getAdoptions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = userRole === 'admin' ? {} : { user: userId };

    const adoptions = await Adoption.find(query)
      .populate('user')
      .populate('pet');

    return res.status(200).json(adoptions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching adoptions', error: error.message });
  }
};

const registerAdoption = async (req, res, next) => {
  try {
    const { petId, comments } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: 'Invalid petId' });
    }

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const existingAdoption = await Adoption.findOne({ pet: petId });

    if (existingAdoption && existingAdoption.status !== 'Rejected') {
      if (existingAdoption.user.toString() === userId.toString()) {
        return res.status(400).json({
          message: 'You have already adopted this pet'
        });
      } else {
        return res.status(400).json({
          message:
            'This pet has already been adopted by another user and is not available'
        });
      }
    }

    const newAdoption = new Adoption({
      pet: petId,
      user: userId,
      comments: comments || '',
      adoptionDate: new Date()
    });

    const savedAdoption = await newAdoption.save();

    return res.status(201).json({
      message: 'Adoption registered successfully',
      adoption: savedAdoption
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error registering adoption',
      error: error.message
    });
  }
};

const updateAdoption = async (req, res, next) => {
  try {
    const { adoptionId } = req.params;
    const { status, comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
      return res.status(400).json({ message: 'Invalid adoption ID' });
    }

    const adoption = await Adoption.findById(adoptionId);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    const updates = {};
    if (status) {
      if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      updates.status = status;
    }
    if (comments !== undefined) {
      updates.comments = comments;
    }

    const updatedAdoption = await Adoption.findByIdAndUpdate(
      adoptionId,
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({
      message: 'Adoption updated successfully',
      adoption: updatedAdoption
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating adoption',
      error: error.message
    });
  }
};

const deleteAdoption = async (req, res, next) => {
  try {
    const { adoptionId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
      return res.status(400).json({ error: 'Invalid Adoption ID format' });
    }

    const adoption = await Adoption.findById(adoptionId);

    if (!adoption) {
      return res.status(404).json({ error: 'Adoption not found' });
    }

    if (adoption.user.toString() !== userId) {
      return res.status(403).json({
        error: 'Unauthorized: You can only delete your own adoption requests'
      });
    }

    await Adoption.findByIdAndDelete(adoptionId);

    return res.status(200).json({
      message: 'Adoption deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Adoption:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAdoptions,
  registerAdoption,
  updateAdoption,
  deleteAdoption
};
