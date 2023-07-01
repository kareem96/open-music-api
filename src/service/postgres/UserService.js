const {Pool} = require('pg');
const bcrypt  = require('bcrypt');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const AuthenticationError = require('../../exception/AuthenticationsError');

class UserServie{
    constructor(){
        this._pool = new Pool();
    }

    async addUser({username, password, fullname}){
        await this.verifyNewUsername(username);
        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = await this._pool.query({
            text: 'insert into users (id, username, password, fullname) values($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        });
        if(!query.rowCount){
            throw new InvariantError('User gagal ditambahkan');
        }
        return query.rows[0].id;
    }

    async getUserById(id){
        const query = await this._pool.query({
            text: 'select id from users where id = $1',
            values: [id],
        });
        if(!query.rowCount){
            throw new NotFoundError('User tidak ditemukan');
        }
    }

    async verifyNewUsername(username){
        const query= await this._pool.query({
            text: 'select username from users where username = $1',
            values: [username]
        });
        if(query.rowCount > 0){
            throw new InvariantError('Gagal menambah user, username sudah digunakan');
        }
    }

    async verifyUserCredential({username, password}){
        const query = await this._pool.query({
            text: 'select id, password from users where username = $1',
            values: [username],
        });
        if(!query.rowCount){
            throw new AuthenticationError('Credentials yang anada berikan salah');
        }
        const {id, password: hashedPassword} = query.rows[0];
        if(!await bcrypt.compare(password, hashedPassword)){
             throw new AuthenticationError('Credentials yang anda berikan salah');
        }
        return id;
    }
}
module.exports = UserServie;