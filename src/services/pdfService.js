const crypto = require('crypto');
const mongoose = require('mongoose');
const pdfRepository = require('../repositories/pdfRepository');
const userRepository = require('../repositories/userRepository');
const courseRepository = require('../repositories/courseRepository');

function generateHash(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

async function uploadPdf(userId, file) {
  const fileHash = generateHash(file.buffer);
  const existingPdf = await pdfRepository.findByHash(fileHash);

  if (existingPdf) {
    return { success: false, message: 'PDF already exists.' };
  }

  const newPdf = await pdfRepository.createPdf({
    filename: file.originalname,
    data: file.buffer,
    contentType: file.mimetype,
    hash: fileHash,
    uploadedBy: userId
  });

  await userRepository.addPdfToUser(userId, newPdf._id);

  return {
    success: true,
    message: 'Successfully uploaded PDF.',
    pdf: newPdf
  };
}

async function removePdf(userId, pdfId) {
  const deletedPdf = await pdfRepository.deletePdfById(pdfId);
  if (!deletedPdf) {
    return { success: false, message: 'PDF does not exist.' };
  }

  await userRepository.removePdfFromUser(userId, pdfId);
  await courseRepository.deleteByPdf(new mongoose.Types.ObjectId(pdfId));

  return { success: true, message: 'PDF successfully deleted.' };
}

module.exports = {
  uploadPdf,
  removePdf
};
