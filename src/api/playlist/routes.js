const routes = (handler) => [
    {
        method: 'GET',
        path: '/playlists',
        handler: (request, h) => handler.getPlaylistHandler(request, h),
    },
    {
        method: 'GET',
        path: '/playlists/{id}',
        handler: (request, h) => handler.getPlaylistByIdHandler(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: (request, h) => handler.getPlaylistSongsHandler(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
    {
        method: 'GET',
        path: '/playlists/{id}/activities',
        handler: (request, h) => handler.getPlaylistSongActivities(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
    {
        method: 'POST',
        path: '/playlists',
        handler: (request, h) => handler.postPlaylistHandler(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: (request, h) => handler.postPlaylistSongHandler(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: (request, h) => handler.deletePlaylistHandler(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: (request, h) => handler.deletePlaylistSongsHandler(request, h),
        options:{
            auth: 'openmusic_jwt'
        }
    },
];
module.exports = routes;