const {Pool} = require('pg');
const InvariantError = require('../../exception/InvariantError');

class AuthenticationsService{
    constructor(){
        this._pool = new Pool();
    }

    async addRefreshToken(token){
        const query = await this._pool({
            text: 'insert into authentications VALUES($1) RETURNING token',
            values: [token],
        });
        if(!query.rowCount){
            throw new InvariantError('Gagal menambahkan refresh token');
        }
    }

    async verifyRefreshToken(token){
        const query = await this._pool({
            text: 'select token from authentications where token = $1',
            values: [token],
        });
        if(!query.length){
            throw new InvariantError('Refresh token tidak valid');
        }
    }

    async deleteRefreshToken(token){
        await this._pool({
            text: 'delete from authentications where token = $1',
            values: [token],
        });
    }
};
module.exports = AuthenticationsService;