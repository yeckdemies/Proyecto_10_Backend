const express = require('express');
const {
  getAdoptions,
  registerAdoption,
  updateAdoption,
  deleteAdoption
} = require('../controllers/adoption.controller');
const { isAuth } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/role');

const adoptionRouter = express.Router();

adoptionRouter.get('/', [isAuth], getAdoptions);
adoptionRouter.post('/registerAdoption', isAuth, registerAdoption);
adoptionRouter.put(
  '/editAdoption/:adoptionId',
  [isAuth, isAdmin],
  updateAdoption
);
adoptionRouter.delete('/deleteAdoption/:adoptionId', isAuth, deleteAdoption);

module.exports = adoptionRouter;
