const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ success: false, message: `Validation failed: ${details}` });
  }
  next();
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  language: Joi.string().valid("en", "hi", "te").default("en"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const quizSubmitSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedOption: Joi.number().integer().min(0).max(3).required(),
        domain: Joi.string().required(),
        difficulty: Joi.string().valid("easy", "medium", "hard").required(),
      })
    )
    .min(3)
    .required(),
  userId: Joi.string().required(),
});

const roadmapSchema = Joi.object({
  userId: Joi.string().required(),
  interests: Joi.array().items(Joi.string()).min(1).max(5).required(),
  language: Joi.string().valid("en", "hi", "te").default("en"),
});

const progressSchema = Joi.object({
  userId: Joi.string().required(),
  lessonId: Joi.string().required(),
  weekNumber: Joi.number().integer().min(1).required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  quizSubmitSchema,
  roadmapSchema,
  progressSchema,
};
