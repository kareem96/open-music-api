const routes = (handler) => [
    {
        method: 'GET',
        path: '/songs',
        method: handler.getSongHandler,
    },
    {
        method: 'GET',
        path: '/songs/{id}',
        method: handler.getSongByIdHandler,
    },
    {
        method: 'POST',
        path: '/songs',
        method: handler.postSongHandler,
    },
    {
        method: 'PUT',
        path: '/songs/{id}',
        method: handler.putSongByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/songs/{id}',
        method: handler.deleteSongByIdHandler,
    },
];

module.exports = routes;