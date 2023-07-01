const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const {mapDBAlbumSongModel} = require('../../utils/albums');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');

class AlbumService{
    constructor(){
        this._pool = new Pool();
    }

    async getAlbum(){
        const result = await this._pool.query('select * from albums');
        return result.rows;
    }

    async getAlbumById(id){
        const album = await this._pool.query ({
            text: 'select * from albums where id = $1',
            values: [id],
        });

        if(!album.rows.length){
            throw new InvariantError('album tidak ditemukan');
        }

        const songs = await this._pool.query({
            text: 'select id, title, performer from songs where album_id = $1',
            values: [album.rows[0].id]
        });

        return mapDBAlbumSongModel({album: album.rows[0], songs: songs.rows})
    }

    async addAlbum({name, year}){
        const id = `album-${nanoid(16)}`;
        const query = await this._pool.query({
            text: 'insert into albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        });
        if(!query.rows[0].id){
            throw new InvariantError('Album gagal ditambahakan');
        }
        return query.rows[0].id;
    }

    async editAlbumById(id, {name, year}){
        const query = await this._pool.query({
            text: 'update albums set name = $1, year = $2 where id = $3 RETURNING id',
            values: [name, year, id],
        })
        if(!query.rows.length){
            throw new NotFoundError('Gagal memperbaahrui album, Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id){
        const query = await this._pool.query({
            text: 'delete from albums where id = $1 RETURNING id',
            values: [id]
        });
        if(!query.rows.length){
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumService;