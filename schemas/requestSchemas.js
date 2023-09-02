import Joi from "joi";

const userCredsSchema = Joi.object({
    username: Joi.string().required().email(),
    password: Joi.string().required().min(8)
});

const jwtToken = Joi.object({
    token: Joi.string().required()
});

const addBirthday = Joi.object({
    recipientName: Joi.string().required().min(5),
    date: Joi.number().required().min(1).max(31),
    month: Joi.number().required().min(1).max(12),
    birthYear: Joi.number().required().min(1800).max(new Date().getFullYear())
});

const deleteBirthday = Joi.object({
    id: Joi.string().required()
})

export { userCredsSchema, jwtToken, addBirthday, deleteBirthday };