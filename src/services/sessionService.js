const SESSION_LOST_MESSAGE = 'Session Lost. Please Log In Again!';

function initSession(req, userData, pdfs = [], courses = []) {
  req.session.user = {
    id: userData._id,
    firstname: userData.firstname,
    lastname: userData.lastname,
    username: userData.username,
    institution: userData.institution,
    pdfs,
    courses
  };
  req.session.loggedIn = true;
}

function clearAlert(req) {
  const message = req.session.alert || null;
  req.session.alert = null;
  return message;
}

module.exports = {
  SESSION_LOST_MESSAGE,
  initSession,
  clearAlert
};
