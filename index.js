require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const userRouter = require('./src/api/routes/user.router');
const petRouter = require('./src/api/routes/pet.router');
const adoptionRouter = require('./src/api/routes/adoption.router');
const cloudinary = require('cloudinary').v2;

const app = express();

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());

app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/pets', petRouter);
app.use('/api/v1/adoptions', adoptionRouter);

app.use('*', (req, res, next) => {
  return res.status(404).json('Route Not Found');
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
