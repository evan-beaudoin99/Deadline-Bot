const test = require('node:test');
const assert = require('node:assert/strict');

const schoolOnboardingService = require('../src/services/schoolOnboardingService');
const schoolRepository = require('../src/repositories/schoolRepository');

function withStubs(stubs, fn) {
  const originals = [];

  for (const [target, method, replacement] of stubs) {
    originals.push([target, method, target[method]]);
    target[method] = replacement;
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [target, method, original] of originals) {
        target[method] = original;
      }
    });
}

test('onboarding requires institution', async () => {
  const result = await schoolOnboardingService.submitSchoolOnboardingRequest({ institution: '' });
  assert.equal(result.success, false);
  assert.equal(result.message, 'Institution is required.');
});

test('onboarding rejects Carleton as already active', async () => {
  const result = await schoolOnboardingService.submitSchoolOnboardingRequest({
    institution: 'Carleton University'
  });

  assert.equal(result.success, false);
  assert.match(result.message, /already the active supported schedule/i);
});

test('onboarding returns existing school without insert', async () => {
  let upsertCalled = false;

  await withStubs(
    [
      [schoolRepository, 'getSchoolByInstitution', async () => ({ institution: 'McGill University' })],
      [
        schoolRepository,
        'upsertOnboardingRequest',
        async () => {
          upsertCalled = true;
          return null;
        }
      ]
    ],
    async () => {
      const result = await schoolOnboardingService.submitSchoolOnboardingRequest({
        institution: 'McGill University'
      });

      assert.equal(result.success, true);
      assert.equal(upsertCalled, false);
    }
  );
});

test('onboarding submits new school request', async () => {
  await withStubs(
    [
      [schoolRepository, 'getSchoolByInstitution', async () => null],
      [
        schoolRepository,
        'upsertOnboardingRequest',
        async ({ institution, contactEmail }) => ({
          institution,
          onboarding: { contactEmail, status: 'pending' }
        })
      ]
    ],
    async () => {
      const result = await schoolOnboardingService.submitSchoolOnboardingRequest({
        institution: 'University of Ottawa',
        contactEmail: 'user@example.com',
        notes: 'Semester info'
      });

      assert.equal(result.success, true);
      assert.equal(result.school.institution, 'University of Ottawa');
      assert.equal(result.school.onboarding.status, 'pending');
    }
  );
});
