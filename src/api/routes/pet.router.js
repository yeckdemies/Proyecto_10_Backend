const express = require('express');
const { isAuth } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/role');
const { uploadPet } = require('../../middlewares/upload-file');
const {
  getAllPet,
  getAvailablePets,
  registerPet,
  updatePet,
  deletePet,
  getPetById
} = require('../controllers/pet.controller');
const petRouter = express.Router();

petRouter.get('/', [isAuth], getAllPet);
petRouter.get('/getAvailablePets', getAvailablePets);
petRouter.get('/:petId', getPetById);
petRouter.post(
  '/registerPet',
  [isAuth, isAdmin, uploadPet.single('imageUrl')],
  registerPet
);
petRouter.put(
  '/editPet/:petId',
  [isAuth, isAdmin, uploadPet.single('imageUrl')],
  updatePet
);
petRouter.delete('/deletePet/:petId', [isAuth, isAdmin], deletePet);

module.exports = petRouter;
