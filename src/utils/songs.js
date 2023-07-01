const mapDBSongModel = ({
    id, title, year, genre, performer, duration, album_id
}) => ({
    id,title, year, genre, performer, duration, album_id
});
module.exports = {mapDBSongModel};