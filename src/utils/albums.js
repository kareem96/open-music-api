const mapDBAlbumSongModel =({album, songs}) => ({
    id: album.id,
    name: album.name,
    year: album.year,
    coverUrl: album.cover_url,
    songs: songs,
});
module.exports = {mapDBAlbumSongModel};