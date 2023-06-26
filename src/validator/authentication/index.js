const InvariantError = require('../../exception/InvariantError');
const {postAuthenticationSchema, putAuthenticationSchema, deleteAuthenticationSchema, } = require('./schema');

const AuthenticationsValidator = {
    validatorPostPayload:(payload) =>{
        const validatorResult = postAuthenticationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    },
    validatorPutPayload:(payload) =>{
        const validatorResult = putAuthenticationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    },
    validatorDeletePayload:(payload) =>{
        const validatorResult = deleteAuthenticationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    },
}

module.exports = AuthenticationsValidator;