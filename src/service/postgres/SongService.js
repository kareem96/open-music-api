const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const {mapDBToMdoel} =  require('../../utils');

class SongService{
    constructor(){
        this._pool = new Pool();
    }

    async getSongs(){
        const result = await this._pool.query('select id, title, performer from songs');
        return result.rows;
    }

    async getSongById(id){
        const query ={
            text: 'select * from songs where id = $1',
            values: [id]
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows.map(mapDBToMdoel)[0];
    }

    async addSong({title, year, performer, duration}){
        const id = `song-${nanoid(16)}`;
        const query ={
            text: 'insert into songs values($1, $2, $3 $4, $5) RETURNING id',
            values: [id, title, year, performer, duration],
        };

        const result = await this._pool.query(query);
        if(!result.rows[0].id){
            throw new InvariantError('Lagu gagal ditambahakan');
        }
        return result.rows[0].id;
    }

    async editSongById(id, {title, year, genre, performer, duration}){
        const query ={
            text: 'update songs set title =$1, year =$2, performer = $3, genre=$4, duration=$5 where id = $6 RETURNING id',
            values: [id, title, year, performer, duration, genre]
        }    
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Gagal memperbaharui lagu, Id tidak ditemukan');
        }
    }
    
    async deleteSongById(id){
        const query ={
            text: 'delete from songs where id = $1 RETURNING id',
            values: [id]
        }    
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Gagal menghapus lagu, Id tidak ditemukan');
        }
    }
}
module.exports = SongService;