const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const {mapDBSongModel} =  require('../../utils/songs');

class SongService{
    constructor(){
        this._pool = new Pool();
    }

    async getSongs(title = '', performer = ''){
        const query  = {
            text: 'select id, title, performer from songs where title ILIKE $1 and performer $2',
            values: [`%${title}%`, `%${performer}%`],
        }

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getSongById(id){
        const query = await this._pool.query({
            text: 'select * from songs where id = $1',
            values: [id]
        });
        
        if(!query.rowCount){
            throw new NotFoundError(`Lagu dengan id: ${id}tidak ditemukan`);
        }
        return query.rows.map(mapDBSongModel)[0];
    }

    async addSong({title, year, performer, genre, duration, albumId}){
        const id = `song-${nanoid(16)}`;
        const query ={
            text: 'insert into songs values($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId], 
        };

        const result = await this._pool.query(query);
        if(!result.rows[0].id){
            throw new InvariantError('Lagu gagal ditambahakan');
        }
        return id;
    }

    async editSongById(id, {title, year, genre, performer, duration, albumId}){
        const query ={
            text: 'update songs set title = $1, year = $2, genre = $3, performer = $4, duration=$5, album_id = $6 where id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id]
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
            throw new NotFoundError('Gagal menghapus lagu, id tidak ditemukan');
        }
    }

    async verifySongIsExists(id){
        const query = await this._pool.query({
            text: 'select id from songs where id = $1',
            values: [id],
        });
        if(!query.rowCount){
            throw new InvariantError('Lagu tidak ditemukan');
        }
    }
}
module.exports = SongService;