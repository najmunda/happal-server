const { expect, test } = require('@jest/globals')
const { validateCardDoc } = require('../utils/validator')

test('New card pass card validator.', async () => {
  const cardDoc = {
    sentence: '2',
    target: '2',
    def: '2',
    date_created: '2025-05-06T07:28:13.095Z',
    srs: {
      card: {
        due: '2025-05-06T07:28:13.095Z',
        stability: 0,
        difficulty: 0,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 0,
        lapses: 0,
        state: 0
      },
      log: null
    },
    _id: 'card-998c39ba-a33a-4c1d-b504-63ebd54333fb',
    _rev: '1-87286700f86b23462da63fc707fd6c69',
    _revisions: { start: 1, ids: ['87286700f86b23462da63fc707fd6c69'] }
  }
  expect(validateCardDoc(cardDoc)).toStrictEqual(true)
})

test('Edited card pass card validator.', async () => {
  const cardDoc = {
    sentence: '33',
    target: '33',
    def: '33',
    date_created: '2025-05-06T07:28:13.095Z',
    srs: {
      card: {
        due: '2025-05-06T07:28:13.095Z',
        stability: 0,
        difficulty: 0,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 0,
        lapses: 0,
        state: 0
      },
      log: null
    },
    _id: 'card-6323fa02-d31e-40eb-ab30-032721845019',
    _rev: '2-cae5a5a78876c5311cee7a92d0ee22ca',
    _revisions: {
      start: 2,
      ids: [
        'cae5a5a78876c5311cee7a92d0ee22ca',
        '1dbafdc5ea00892d133f038b5b7ba43e'
      ]
    }
  }
  expect(validateCardDoc(cardDoc)).toStrictEqual(true)
})

test('Reviewed card pass card validator.', async () => {
  const cardDoc = {
    sentence: '1',
    target: '1',
    def: '1',
    date_created: '2025-05-06T07:28:13.095Z',
    srs: {
      card: {
        due: '2025-05-06T07:38:28.570Z',
        stability: 3.173,
        difficulty: 5.28243442,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 1,
        lapses: 0,
        state: 1,
        last_review: '2025-05-06T07:28:28.570Z'
      },
      log: {
        rating: 3,
        state: 0,
        due: '2025-05-06T07:28:13.095Z',
        stability: 0,
        difficulty: 0,
        elapsed_days: 0,
        last_elapsed_days: 0,
        scheduled_days: 0,
        review: '2025-05-06T07:28:28.570Z'
      }
    },
    _id: 'card-029b64bb-7cd7-49cf-8a31-64a6a27d3a44',
    _rev: '2-92ef232c1c8bcb19bc6c3ea977e5e32e',
    _revisions: {
      start: 2,
      ids: [
        '92ef232c1c8bcb19bc6c3ea977e5e32e',
        '8d77d22b0e125edaae584655a218d741'
      ]
    }
  }
  expect(validateCardDoc(cardDoc)).toStrictEqual(true)
})

test('Deleted card pass card validator.', async () => {
  const cardDoc = {
    _deleted: true,
    _id: 'card-5e54b819-661d-413c-b8a8-2209f1eb2d89',
    _rev: '2-7208dfe17fc0dc51c11c00943ce7ed5c',
    _revisions: {
      start: 2,
      ids: [
        '7208dfe17fc0dc51c11c00943ce7ed5c',
        'ccd2bf699734f89573c7e12824cf7d98'
      ]
    }
  }
  expect(validateCardDoc(cardDoc)).toStrictEqual(true)
})

test('Bad structure card returned with bad_structure keys.', async () => {
  const cardDoc = {
    _deleted: true,
    _id: 'card-5e54b819',
    _rev: '2-7208dfe17fc0dc51c11c00943ce7ed5c',
    tess: 98214,
    _revisions: {
      start: 2,
      ids: [
        '7208dfe17fc0dc51c11c00943ce7ed5c',
        'ccd2bf699734f89573c7e12824cf7d98',
        0
      ]
    }
  }

  expect(validateCardDoc(cardDoc)).toStrictEqual(false)
})
