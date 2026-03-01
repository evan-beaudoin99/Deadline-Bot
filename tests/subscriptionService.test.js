const test = require('node:test');
const assert = require('node:assert/strict');

const subscriptionService = require('../src/services/subscriptionService');
const userRepository = require('../src/repositories/userRepository');

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

test('subscribe fails if user does not exist', async () => {
  await withStubs(
    [[userRepository, 'findById', async () => null]],
    async () => {
      const result = await subscriptionService.subscribe('u1');
      assert.equal(result.success, false);
      assert.equal(result.message, 'Could not find user with id');
    }
  );
});

test('subscribe fails if already subscribed', async () => {
  await withStubs(
    [[userRepository, 'findById', async () => ({ _id: 'u1', subscribed: true })]],
    async () => {
      const result = await subscriptionService.subscribe('u1');
      assert.equal(result.success, false);
      assert.equal(result.message, 'User already Subscribed');
    }
  );
});

test('subscribe sets subscription for eligible user', async () => {
  let setCalled = false;

  await withStubs(
    [
      [userRepository, 'findById', async () => ({ _id: 'u1', subscribed: false })],
      [
        userRepository,
        'setSubscribed',
        async (id, value) => {
          setCalled = id === 'u1' && value === true;
        }
      ]
    ],
    async () => {
      const result = await subscriptionService.subscribe('u1');
      assert.equal(result.success, true);
      assert.equal(setCalled, true);
    }
  );
});
