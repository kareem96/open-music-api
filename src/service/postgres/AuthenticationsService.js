const {Pool} = require('pg');
const InvariantError = require('../../exception/InvariantError');

class AuthenticationsService{
    constructor(){
        this._pool = new Pool();
    }

    async addRefreshToken(token){
        const query = {
            text: 'insert into authentications VALUES($1)',
            values: [token],
        };
        await this._pool.query(query);
    }

    async verifyRefreshToken(token){
        const query = {
            text: 'select token from atuhentications where token = $1',
            values: [token],
        };
        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new InvariantError('Refesh token tidak valid');
        }
    }

    async deleteRefreshToken(token){
        await this.verifyRefershToken(token);
        const query ={
            text: 'delete from authentications where token = $1',
            values: [token],
        };
        await this._pool.query(query);
    }
}
module.exports = AuthenticationsService;