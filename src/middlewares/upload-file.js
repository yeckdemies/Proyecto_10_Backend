const multer = require('multer');

/* He tenido que guardar en memoria la imagen porque se subía aunque la mascota existiese, de esta manera puedo controlar mejor ese caso */
const storage = multer.memoryStorage(); // Guardar la imagen en memoria
const uploadPet = multer({ storage });

module.exports = { uploadPet };
