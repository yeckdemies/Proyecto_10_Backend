const jwt = require('jsonwebtoken');

//Generar token
const signGenerate = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

//Validar token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signGenerate, verifyToken };
