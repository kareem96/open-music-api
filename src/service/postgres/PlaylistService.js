const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError')
const AuthorizationError = require('../../exception/AuthorizationError');

class PlaylistServices{
    constructor(collaborationService){
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    async addPlaylist(name, owner){
        const id = `playlist-${nanoid(16)}`;
        const query = await this._pool.query({
            text: 'insert into playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        });
        
        if(!query.rowCount){
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return query.rows[0].id;
    }

    async getPlaylist(owner){
        const query = await this._pool.query({
            text: `select p.id, p.name, u.username from playlists p 
            left join collaborations c on c.playlist_id = p.id
            left join users u on u.id = p.owner
            where p.owner = $1 or c.user_id = $1`,
            values: [owner],
        })
        return query.rows;
    }

    async deletePlaylistById(id){
        const query = await this._pool.query({
            text: 'delete from playlists where id = $1 RETURNING id',
            values: [id],
        });
        if(!query.rowCount){
            throw new InvariantError('Gagal delete playlist, id tidak ditemukan')
        }
    }

    async addPlaylistSong(playlistId, songId){
        const id = `ps-${nanoid(16)}`;
        const query = await this._pool.query({
            text: 'insert into playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        });
        if(!query.rowCount){
            throw new InvariantError('Gagal menambhakan lagu ke playlist');
        }
    }

    async getPlaylistSong(playlistId, owner){
        const playlist = await this._pool.getPlaylistById({
            text: `select plalists.id, playlists.name, users.name from playlists
             full outer join users on users_id = playlists.owner
             where playlist.id = $1`,
            values: [playlistId]
        });

        const songs = await this._pool.query({
            text: `select songs.id, songs.title, songs.performer from songs
            left join playlist_songs ps on songs.id, = ps.song_id
            left join playlists on playlists.id = ps.playlist_id
            where playlist_id = $1 or playlists.owner = $2`,
            values: [playlistId, owner]
        });
        playlist.rows[0].songs = songs.rows;
        return playlist.rows[0];
    }

    async deletePlaylistSong(id){
        const query = await this._pool.query({
            text: 'delete from playlist_songs where song_id = $1 RETURNING id',
            values: [id],
        });
        if(!query.rowCount){
            throw new NotFoundError('Lagu tidak ditemukan di dalam playlist');
        }
    }

    async verifyPlaylistOwner(id, user){
        const query = await this._pool.query({
            text: 'select owner from playlists where id = $1',
            values: [id],
        });
        if(!query.rowCount){
            throw new NotFoundError('playlist tidak ditemukan');
        }
        if(query.rows[0].owner !== owner){
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(id, user){
        try{
            await this.verifyPlaylistOwner(id, user);
        }catch(e){
            if(e instanceof NotFoundError){
                throw e;
            }
            try{
                await this._collaborationService.verifyCollaborations(id, user);
            }catch{
                throw e;
            }
        }
    }

}
module.exports = PlaylistServices;