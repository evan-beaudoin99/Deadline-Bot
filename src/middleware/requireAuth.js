const { SESSION_LOST_MESSAGE } = require('../services/sessionService');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    req.session.alert = SESSION_LOST_MESSAGE;
    return res.redirect('/login');
  }

  return next();
}

module.exports = { requireAuth };
