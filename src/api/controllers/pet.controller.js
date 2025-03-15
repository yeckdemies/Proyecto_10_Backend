const mongoose = require('mongoose');
const Pet = require('../models/pet.model');
const { deletefile } = require('../../utils/deletefile');
const { uploadPet } = require('../../middlewares/upload-file');
const Adoption = require('../models/adoption.model');
const cloudinary = require('cloudinary').v2;

const getAllPet = async (req, res, next) => {
  try {
    const pets = await Pet.find();

    if (!pets.length) {
      return res.status(404).json({ message: 'No pets found' });
    }

    return res.status(200).json(pets);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching pets', error: error.message });
  }
};

const getAvailablePets = async (req, res, next) => {
  try {
    const activeAdoptions = await Adoption.find({
      status: { $ne: 'Rejected' }
    }).distinct('pet');

    const availablePets = await Pet.find({ _id: { $nin: activeAdoptions } });

    return res.status(200).json({ availablePets });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching available pets',
      error: error.message
    });
  }
};

const registerPet = async (req, res, next) => {
  try {
    const { chip, name, age, sexo, size, type } = req.body;

    const existingPet = await Pet.findOne({ chip });

    if (existingPet) {
      return res.status(400).json({ message: 'Chip already exists' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: 'pets' },
      async (error, uploadResult) => {
        if (error) {
          return res.status(500).json({
            message: 'Error uploading image',
            error: error.message
          });
        }

        try {
          const newPet = new Pet({
            chip,
            name,
            age,
            sexo,
            size,
            type,
            imageUrl: uploadResult.secure_url
          });

          const savedPet = await newPet.save();

          return res.status(201).json({
            message: 'Pet registered successfully',
            pet: savedPet
          });
        } catch (saveError) {
          return res.status(500).json({
            message: 'Error saving pet',
            error: saveError.message
          });
        }
      }
    );

    result.end(req.file.buffer); //! Enviar el buffer de la imagen a Cloudinary
  } catch (error) {
    return res.status(500).json({
      message: 'Error registering pet',
      error: error.message
    });
  }
};

const updatePet = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { chip, name, age, sexo, size, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: 'Invalid Pet ID format' });
    }

    const petToUpdate = await Pet.findById(petId);
    if (!petToUpdate) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (chip) {
      return res.status(400).json({
        message: 'Chip cannot be updated. Delete the pet and create a new one'
      });
    }

    const changes = {};

    if (name && name !== petToUpdate.name) {
      changes.name = name;
    }
    if (age && Number(age) !== petToUpdate.age) {
      changes.age = Number(age);
    }
    if (sexo && sexo !== petToUpdate.sexo) {
      changes.sexo = sexo;
    }
    if (size && size !== petToUpdate.size) {
      changes.size = size;
    }

    if (type && type !== petToUpdate.type) {
      changes.type = type;
    }

    if (req.file) {
      try {
        if (petToUpdate.imageUrl) {
          const publicId = petToUpdate.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`pets/${publicId}`);
        }

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'pets' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        changes.imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error uploading new image:', uploadError);
        return res.status(500).json({
          message: 'Error updating pet image',
          error: uploadError.message
        });
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    Object.assign(petToUpdate, changes);
    await petToUpdate.save();

    return res.status(200).json({
      message: 'Pet updated successfully',
      updatedFields: changes
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating pet',
      error: error.message
    });
  }
};

const deletePet = async (req, res, next) => {
  try {
    const { petId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: 'Invalid Pet ID format' });
    }

    const petDeleted = await Pet.findByIdAndDelete(petId);

    if (!petDeleted) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (petDeleted.imageUrl) {
      try {
        await deletefile(petDeleted.imageUrl);
      } catch (fileError) {
        console.error('Error deleting the image file:', fileError);
      }
    }

    return res
      .status(200)
      .json({ mmessage: 'Pet deleted successfully', recipe: petDeleted });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPetById = async (req, res) => {
  try {
    const { petId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: 'Invalid pet ID' });
    }

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    return res.status(200).json(pet);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching pet', error: error.message });
  }
};

module.exports = {
  getAllPet,
  getAvailablePets,
  registerPet,
  updatePet,
  deletePet,
  getPetById
};
