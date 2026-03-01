const schoolRepository = require('../repositories/schoolRepository');

const ACTIVE_INSTITUTION = 'Carleton University';

function normalizeInstitution(value) {
  return `${value || ''}`.trim();
}

async function submitSchoolOnboardingRequest(payload) {
  const institution = normalizeInstitution(payload.institution);
  const contactEmail = `${payload.contactEmail || ''}`.trim();
  const notes = `${payload.notes || ''}`.trim();

  if (!institution) {
    return { success: false, message: 'Institution is required.' };
  }

  if (institution.toLowerCase() === ACTIVE_INSTITUTION.toLowerCase()) {
    return {
      success: false,
      message: `${ACTIVE_INSTITUTION} is already the active supported schedule.`
    };
  }

  const existingSchool = await schoolRepository.getSchoolByInstitution(institution);
  if (existingSchool) {
    return {
      success: true,
      message: 'School already exists. Onboarding request has been recorded previously.',
      school: existingSchool
    };
  }

  const school = await schoolRepository.upsertOnboardingRequest({
    institution,
    contactEmail,
    notes
  });

  return {
    success: true,
    message: 'School onboarding request submitted. We will use Carleton schedule until this school is activated.',
    school
  };
}

module.exports = {
  submitSchoolOnboardingRequest,
  ACTIVE_INSTITUTION
};
