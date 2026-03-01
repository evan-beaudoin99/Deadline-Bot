const School = require('../../models/School');

async function getSchoolByInstitution(institution) {
  return School.findOne({ institution }).lean();
}

async function insertSchool(schoolData) {
  return School.create(schoolData);
}

async function upsertOnboardingRequest({ institution, contactEmail, notes }) {
  return School.findOneAndUpdate(
    { institution },
    {
      $setOnInsert: {
        institution,
        onboarding: {
          status: 'pending',
          requestedAt: new Date(),
          contactEmail,
          notes
        },
        isScheduleActive: false
      }
    },
    { upsert: true, new: true }
  );
}

module.exports = {
  getSchoolByInstitution,
  insertSchool,
  upsertOnboardingRequest
};
