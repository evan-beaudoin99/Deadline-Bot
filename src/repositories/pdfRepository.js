const Pdf = require('../../models/Pdf');

async function findByHash(hash) {
  return Pdf.findOne({ hash });
}

async function createPdf(pdfData) {
  return Pdf.create(pdfData);
}

async function deletePdfById(pdfId) {
  return Pdf.findByIdAndDelete(pdfId);
}

module.exports = {
  findByHash,
  createPdf,
  deletePdfById
};
