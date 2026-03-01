function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).render('home', {
    alertMessage: 'Unexpected server error. Please try again.',
    success: false
  });
}

module.exports = { errorHandler };
