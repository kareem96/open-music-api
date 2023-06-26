const InvariantError = require('../../exception/InvariantError');
const {CollaborationSchema} = require('./schema');

const CollaborationValidator ={
    validatorCollaborationPayload: (payload) =>{
        const validatorResult = CollaborationSchema.validate(payload);
        if(validatorResult.error){
            throw new InvariantError(validatorResult.error.message);
        }
    }
};

module.exports = CollaborationValidator;