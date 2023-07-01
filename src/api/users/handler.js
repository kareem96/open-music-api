const autoBind = require("auto-bind");

class UsersHandler{
    constructor(service, validator){
        this._service = service;
        this._validator = validator;
        autoBind(this);
    }

    async getUserByIdHandler(request, h){
        const {id} = request.params;
        const user = await this._service.getUserById(id);
        const response = h.response({
            status: 'success',
            data : {
                user,
            }
        });
        response.code(200);
        return response;
    }


    async postUserHandler(request, h){
        await this._validator.validateUserPayload(request.payload);
        const userId = await this._service.addUser(request.payload);
        
        const response = h.response({
            status: 'success',
            data:{
                userId,
            }
        });
        response.code(201);
        return response;
    }
}

module.exports = UsersHandler;