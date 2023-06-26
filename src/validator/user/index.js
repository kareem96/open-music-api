const InvariantError = require('../../exception/InvariantError');
const { UserPayloadSchema } = require('./schema');

const UserValidator = {
    validateUserPayload: (payload) =>{
        const validateResult = UserPayloadSchema.validate(payload);
        if(validateResult.error){
            throw new InvariantError(validateResult.error.message);
        }
    }
};
module.exports = UserValidator;