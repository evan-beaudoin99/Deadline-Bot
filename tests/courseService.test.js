const test = require('node:test');
const assert = require('node:assert/strict');

const courseService = require('../src/services/courseService');
const courseRepository = require('../src/repositories/courseRepository');
const userRepository = require('../src/repositories/userRepository');
const pdfRepository = require('../src/repositories/pdfRepository');

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

test('createCourse returns failure when duplicate exists', async () => {
  await withStubs(
    [
      [courseRepository, 'findByCodeAndSection', async () => ({ _id: 'existing' })]
    ],
    async () => {
      const result = await courseService.createCourse('u1', {
        course_code: 'COMP3005',
        section: 'A',
        pdfId: '507f1f77bcf86cd799439011'
      });

      assert.equal(result.success, false);
      assert.equal(result.message, 'Course Already Exists');
    }
  );
});

test('createCourse persists and links course to user', async () => {
  let addCourseCalled = false;

  await withStubs(
    [
      [courseRepository, 'findByCodeAndSection', async () => null],
      [
        courseRepository,
        'createCourse',
        async (payload) => ({ _id: 'course1', ...payload })
      ],
      [
        userRepository,
        'addCourseToUser',
        async (userId, courseId) => {
          addCourseCalled = userId === 'u1' && courseId === 'course1';
        }
      ]
    ],
    async () => {
      const result = await courseService.createCourse('u1', {
        course_code: 'COMP3005',
        course_name: 'Databases',
        section: 'A',
        pdfId: '507f1f77bcf86cd799439011'
      });

      assert.equal(result.success, true);
      assert.equal(result.course.course_code, 'COMP3005');
      assert.equal(addCourseCalled, true);
    }
  );
});

test('getCourseData returns expected success/failure states', async () => {
  await withStubs(
    [[userRepository, 'getUserCourses', async () => []]],
    async () => {
      const result = await courseService.getCourseData('u1');
      assert.equal(result.success, false);
      assert.equal(result.message, 'User has no Course Data');
    }
  );

  await withStubs(
    [[userRepository, 'getUserCourses', async () => [{ _id: 'c1' }]]],
    async () => {
      const result = await courseService.getCourseData('u1');
      assert.equal(result.success, true);
      assert.equal(result.courses.length, 1);
    }
  );
});

test('createCourse requires one uploaded document', async () => {
  await withStubs(
    [[courseRepository, 'findByCodeAndSection', async () => null]],
    async () => {
      const result = await courseService.createCourse('u1', {
        course_code: 'COMP3005',
        section: 'A'
      });

      assert.equal(result.success, false);
      assert.match(result.message, /upload one course document/i);
    }
  );
});

test('removeCourse returns not found when course does not exist', async () => {
  await withStubs(
    [[courseRepository, 'findByIdForUser', async () => null]],
    async () => {
      const result = await courseService.removeCourse('u1', 'c1');
      assert.equal(result.success, false);
      assert.equal(result.message, 'Course not found.');
    }
  );
});

test('removeCourse deletes course, linked PDFs, and user refs', async () => {
  let deletedCourse = false;
  let removedCourseRef = false;
  const deletedPdfs = [];
  const removedPdfRefs = [];

  await withStubs(
    [
      [
        courseRepository,
        'findByIdForUser',
        async () => ({ _id: 'c1', pdfs: ['p1', 'p2'] })
      ],
      [
        pdfRepository,
        'deletePdfById',
        async (pdfId) => {
          deletedPdfs.push(pdfId);
        }
      ],
      [
        userRepository,
        'removePdfFromUser',
        async (userId, pdfId) => {
          removedPdfRefs.push([userId, pdfId]);
        }
      ],
      [
        courseRepository,
        'deleteById',
        async (courseId, userId) => {
          deletedCourse = courseId === 'c1' && userId === 'u1';
        }
      ],
      [
        userRepository,
        'removeCourseFromUser',
        async (userId, courseId) => {
          removedCourseRef = userId === 'u1' && courseId === 'c1';
        }
      ]
    ],
    async () => {
      const result = await courseService.removeCourse('u1', 'c1');

      assert.equal(result.success, true);
      assert.equal(deletedCourse, true);
      assert.equal(removedCourseRef, true);
      assert.deepEqual(deletedPdfs, ['p1', 'p2']);
      assert.deepEqual(removedPdfRefs, [['u1', 'p1'], ['u1', 'p2']]);
    }
  );
});
