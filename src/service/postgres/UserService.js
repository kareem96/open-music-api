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
        await this._verifyNewuserName(username);
        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: 'insert into users values($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        };

        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new InvariantError('User gagal ditambahkan');
        }
        return id;
    }

    async getUserById(id){
        const query = {
            text: 'select id, username, fullname from users where id = $1',
            values: [id],
        };

        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new NotFoundError('User tidak ditemukan');
        }
        return rows[0];
    }

    async verifyNewUsernmae(username){
        const query= {
            text: 'select id from users where username = $1',
            values: [username]
        };
        const {rows} = await this._pool.query(query);
        if(rows.length){
            throw new InvariantError('Gagal menambah user, username sudah digunakan');
        }
    }

    async verifyUserCredential(username, password){
        const query = {
            text: 'select id, password from users, where username = $1',
            values: [username],
        };
        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new AuthenticationError('Credentials yang anada berikan salah');
        }
        const {id, password: hashedPassword} = rows[0];
        const match = await bcrypt.compare(password, hashedPassword);
        if(!match){
             throw new AuthenticationError('Credentials yang anda berikan salah');
        }
        return id;
    }
}
module.exports = UserServie;