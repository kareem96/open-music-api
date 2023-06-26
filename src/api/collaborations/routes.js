const routes = (handler) => [
    {
        method: 'POST',
        path: '/collaborations',
        handler: (request, h) => handler.postCollaborationHandler(request, h),
        options:{
            auth: 'openmusic-jwt'
        },
    },
    {
        method: 'DELETE',
        path: '/collaborations',
        handler: (request, h) => handler.deleteCollaborationHandler(request, h),
        options:{
            auth: 'openmusic-jwt'
        },
    },
];
module.exports = routes;