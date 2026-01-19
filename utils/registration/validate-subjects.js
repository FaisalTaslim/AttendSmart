const Joi = require("joi");

module.exports = Joi.object({
    class: Joi.string().trim().required(),
    majors: Joi.array().items(Joi.string().trim()).min(1).required(),
    optionals: Joi.array().items(Joi.string().trim()).optional(),
    minors: Joi.array().items(Joi.string().trim()).optional(),
});