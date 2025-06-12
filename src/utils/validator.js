const Joi = require('joi')

const cardSchema = Joi.object({
  sentence: Joi.string().trim(),
  target: Joi.string().trim(),
  def: Joi.string().trim(),
  date_created: Joi.string().isoDate(),
  srs: Joi.object({
    card: Joi.object({
      due: Joi.string().isoDate().required(),
      stability: Joi.number().required(),
      difficulty: Joi.number().required(),
      elapsed_days: Joi.number().required(),
      scheduled_days: Joi.number().required(),
      reps: Joi.number().required(),
      lapses: Joi.number().required(),
      state: Joi.number().valid(0, 1, 2, 3).required(),
      last_review: Joi.string().isoDate()
    }).required(),
    log: Joi.object({
      rating: Joi.number().valid(0, 1, 2, 3, 4).required(),
      state: Joi.number().valid(0, 1, 2, 3).required(),
      due: Joi.string().isoDate().required(),
      stability: Joi.number().required(),
      difficulty: Joi.number().required(),
      elapsed_days: Joi.number().required(),
      last_elapsed_days: Joi.number().required(),
      scheduled_days: Joi.number().required(),
      review: Joi.string().isoDate().required()
    })
      .allow(null)
      .required()
  }),
  _id: Joi.string()
    .pattern(/^card-[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/)
    .required(),
  _rev: Joi.string().pattern(/^\d+-[a-f0-9]+$/),
  _deleted: Joi.boolean(),
  _revisions: Joi.object({
    start: Joi.number().positive(),
    ids: Joi.array().items(Joi.string().pattern(/^[a-f0-9]+$/))
  }),
  _conflicts: Joi.array().items(Joi.string().pattern(/^\d+-[a-f0-9]+$/))
})

function validateCardDoc(card) {
  const { error } = cardSchema.validate(card)
  return error ? false : true
}

module.exports = { validateCardDoc }
