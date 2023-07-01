/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      foreignKeys: true,
      notNull: true,
      references: 'playlists(id)',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      foreignKeys: true,
      references: 'users(id)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
