const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');

class AlbumService{
    constructor(){
        this._pool = new Pool();
    }

    async getAlbum(){
        const result = await this._pool.query('select id, name, year from albums');
        return result.rows;
    }

    async getAlbumById(id){
        const query = {
            text: 'select * from albums where id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Album tidak ditemukan');
        }
        return result.rows[0];
    }

    async addAlbum({ name, year }) {
        const albumId = 'album-'.concat(nanoid(16));
    
        const query = {
          text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
          values: [albumId, name, year],
        };
    
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
          throw new InvariantError('Gagal menambahkan album');
        }
    
        return albumId;
      }

    async editAlbumById(id, {name, year}){
        const query = {
            text: 'update albums set name = $1, year = $2 where id = $3 RETURNING id',
            values: [name, year, id],
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Gagal memperbaahrui album, Id tidak ditemukan');
        }
    }
    async deleteAlbumById(id){
        const query = {
            text: 'delete from albums where id = $1 RETURNING id',
            values: [id]
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumService;