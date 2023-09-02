import { addBirthday, deleteBirthday, userCredsSchema } from '../schemas/requestSchemas.js';

const bodyValidationRules = {
    '/auth/header/get': userCredsSchema,
    '/auth/register': userCredsSchema,
    '/birthday/add': addBirthday,
    '/birthday/delete': deleteBirthday
}

function getSchema(req) {
    let path = req.originalUrl;
    return bodyValidationRules[path];
}

function validateSchema(reqBody, schema) {
    let result = schema?.validate(reqBody, { abortEarly: false });
    return result?.error?.details?.map(errDetail => errDetail.message);
}

function requestBodyValidationMiddleware(req, res, next) {
    let schema = getSchema(req);
    let validationErrors = validateSchema(req.body, schema);

    if (!schema || !validationErrors) {
        next();
        return;
    };
    
    req.logger.error(`Request body validation error: ${validationErrors.join(', ')}`);
    res.status(400).send({ error: validationErrors });
}

export { requestBodyValidationMiddleware };