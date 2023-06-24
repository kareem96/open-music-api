/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlist', {
        id:{
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        playlist_id:{
            type:'VARCHAR(50)',
            notNull: true
        },
        song_id:{
            tyoe: 'VARCHAR(50)',
            notNull: true,
        }
    });

    pgm.addConstraint(
        'playlist_songs',
        'unique_playlist_id_song_id',
        'UNIQUE(playlist_id, song_id)',
    );
    pgm.addConstraint(
        'playlist_songs',
        'fk_playlist_songs.playlist_id_playlist.id',
        'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE',
    );
    pgm.addConstraint(
        'playlist_songs',
        'fk_playlist_songs.song_id_songs.id',
        'FOREIGN KEY(playlist_id) REFERENCES osngs(id) ON DELETE CASCADE',
    );
};

exports.down = (pgm) => {
    pgm.dropTable('playlist_songs');
};