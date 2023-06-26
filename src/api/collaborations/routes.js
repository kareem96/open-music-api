const routes = (handler) => [
    {
        method: 'POST',
        path: '/collaborations',
        handler: handler.postCollaborationHandler,
        options:{
            auth: 'openmusic-jwt'
        },
    },
    {
        method: 'DELETE',
        path: '/collaborations',
        handler: handler.deleteCollaborationHandler,
        options:{
            auth: 'openmusic-jwt'
        },
    },
];
module.exports = routes;