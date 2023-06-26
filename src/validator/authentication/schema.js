const Joi = require("joi");

const postAuhtenticationSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const putAuhtenticationSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

const deleteAuhtenticationSchema = Joi.object({
    refreshToken: Joi.string().required(),
})

module.exports = {
    postAuhtenticationSchema,
    putAuhtenticationSchema,
    deleteAuhtenticationSchema,
};