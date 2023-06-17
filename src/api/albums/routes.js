const routes = (handler) => [
    {
        method: 'GET',
        path:'/albums/{id}',
        handler: (request, h) => handler.getAlbumByIdHandler(request, h),
    },
    {
        method: 'POST',
        path:'/albums',
        handler: () => handler.postAlbumHandler(request, h),
    },
    {
        method: 'PUT',
        path:'/albums/{id}',
        handler: (request, h) => handler.putAlbumByIdHandler(request, h),
    },
    {
        method: 'DELETE',
        path:'/albums/{id}',
        handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
    },
];

module.exports = routes;