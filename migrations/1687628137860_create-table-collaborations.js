/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('collaborations', {
        id:{
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id:{
            type: 'VARCHAR(50)',
            notNull: true,
            foreignKeys: true,
            references: 'playlists(id)'
        },
        user_id:{
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            foreignKeys: true
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('collaborations');
};
