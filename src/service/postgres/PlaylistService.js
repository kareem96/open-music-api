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
        const query ={
            text: 'insert into playlist VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };
        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new InvariantError('Playlist gagal ditambahkan');
        }
    }

    async getPlaylist(owner){
        const query = {
            text: 'select playlist.id, playlist.name, users.username from playlist inner join users on playlist.owner= users.id left join collaborations on playlist.id = collaborations.playlist_id where users.id = $1 or collaborations.user_id = $1',
            values: [owner],
        };
        const {rows} = await this._pool.query(query);
        return rows;
    }

    async getPlaylistById(id){
        const query ={
            text: 'select playlist.id, playlist.name, users.username, from playlist inner join users on playlist.owner = users.id where playlist.id = $1',
            values: [id]
        };
        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        return rows[0];
    }

    async deletePlaylist(id){
        const query ={
            text: 'delete from playlist where id = $1 RETURNING id',
            values: [id],
        };
        await this._pool.query(query);
    }

    async addPlaylistSong(playlistId, songId){
        const id = `ps-${nanoid(16)}`;
        const query ={
            text: 'insert into playlist_song VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        };

        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new InvariantError('Gagal menambhakan lagu ke playlist');
        }
    }

    async getPlaylistSong(id){
        const playlist = await this._pool.query(query);
        const query = {
            text: 'select songs.id, songs.title, songs.performer, from playlist_songs inner join songs on playlist_songs.song_id = songs.id where playlist_songs.playlist_id = $1',
            values: [id]
        };
        const {rows} = await this._pool.query(query);
        playlist.songs = rows;
        return playlist;
    }

    async deletePlaylistSong(id){
        const query = {
            text: 'delete from plalist_songs where song_id = $1 RETURNING id',
            values: [id],
        };

        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new NotFoundError('Lagu tidak ditemukan di dalam playlist');
        }
    }

    async getPlaylistSongActivites(playlistId){
        const query = {
            text: 'select users.username, songs.title, action, time from playlist_song_activities inner join songs on playlist_song_activities.song_id = songs.id inner join users on playlist_song_activities.user_id = users.id where playlist_id = $1',
            values: [playlistId],
        }
        const {rows} = await this._pool.query(query);
        return rows;
    }

    async addPLaylistSongActivities(playlistId, songId, userId, action){
        const id = `act-${nanoid(16)}`;
        const time = new Date();
        const query = {
            text: 'insert into playlist_song_activities VALUES{$1, $2, $3, $4, $5, $6)',
            values: [id, playlistId, songId, userId, action,  time]
        }
        await this._pool.query(query);
    }

    async verifyPlaylistOwner(id, user){
        const query = {
            text: 'select * from playlist where id = $1',
            values: [id],
        }

        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new NotFoundError('playlist tidak ditemukan');
        }
        const {owner} = rows[0];
        if(owner != user){
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(id, user){
        try{
            await this._collaborationService.verifyCollaboration(id, user);
        }catch{
            try{
                await this.verifyPlaylistOwner(id, user);
            }catch(error){
                throw error;
            }
        }
    }

}
module.exports = PlaylistServices;