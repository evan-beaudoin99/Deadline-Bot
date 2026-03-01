const authService = require('../services/authService');
const { initSession, clearAlert } = require('../services/sessionService');

async function showLogin(req, res) {
  const message = clearAlert(req);
  return res.render('login', { alertMessage: message });
}

async function showRegister(req, res) {
  const message = clearAlert(req);
  return res.render('register', { alertMessage: message });
}

async function login(req, res) {
  const { username, password } = req.body;
  const result = await authService.loginUser(username, password);

  if (!result.success) {
    return res.render('login', { alertMessage: result.message || 'Log In Failed.' });
  }

  initSession(req, result.user, result.pdfs, result.courses);
  return res.render('home', { alertMessage: result.message });
}

async function register(req, res) {
  const payload = {
    firstname: `${req.body.firstname}`,
    lastname: `${req.body.lastname}`,
    username: `${req.body.username}`,
    email: `${req.body.email}`,
    institution: `${req.body.institution}`,
    subscribed: Boolean(req.body.isChecked),
    program: `${req.body.program}`,
    password: req.body.password
  };

  const result = await authService.registerUser(payload);

  if (!result.success) {
    return res.render('register', { alertMessage: result.message });
  }

  initSession(req, result.user, [], []);
  return res.render('home', { alertMessage: result.message });
}

async function logout(req, res) {
  if (!req.session.loggedIn) {
    return res.status(200).send("Not Logged In. <a href='/login'>Log In</a>");
  }

  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = {
  showLogin,
  showRegister,
  login,
  register,
  logout
};
