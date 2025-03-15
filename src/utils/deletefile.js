const cloudinary = require('cloudinary').v2;

const deletefile = (filePath) => {
  const urlSplited = filePath.split('/');
  const folderName = urlSplited.at(-2);
  const fileName = urlSplited.at(-1);
  const fileNameSplited = fileName.split('.');
  const fileNameCleaned = fileNameSplited[0];
  const public_id = `${folderName}/${fileNameCleaned}`;

  cloudinary.uploader.destroy(public_id, (error, result) => {
    if (error) {
      console.log(error);
    }
    console.log(result);
  });
};

module.exports = { deletefile };
