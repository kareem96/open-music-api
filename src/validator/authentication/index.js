const InvariantError = require('../../exception/InvariantError');
const {
    postAuthenticationSchema,
    putAuthenticationSchema,
    deleteAuthenticationSchema,
} = require('./schema');

const AuthenticationsValidator = {
    validatePostAuthPayload:(payload) =>{
        const validatorResult = postAuthenticationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    },
    validatePutAuthPayload:(payload) =>{
        const validatorResult = putAuthenticationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    },
    validateDeleteAuthPayload:(payload) =>{
        const validatorResult = deleteAuthenticationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    },
}

module.exports = AuthenticationsValidator;