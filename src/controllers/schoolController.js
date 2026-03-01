const schoolOnboardingService = require('../services/schoolOnboardingService');
const { clearAlert } = require('../services/sessionService');

async function showOnboardingForm(req, res) {
  const message = clearAlert(req);
  return res.render('onboardSchool', { alertMessage: message });
}

async function submitOnboardingForm(req, res) {
  const result = await schoolOnboardingService.submitSchoolOnboardingRequest({
    institution: req.body.institution,
    contactEmail: req.body.contactEmail,
    notes: req.body.notes
  });

  req.session.alert = result.message;
  return res.redirect('/register');
}

module.exports = {
  showOnboardingForm,
  submitOnboardingForm
};
