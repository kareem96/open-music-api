const routes = (handler) => [
    {
        method: 'GET',
        path: '/users/{id}',
        handler: (request, h) =>  handler.getUserByIdHandler(request,h),
    },
    {
        method: 'POST',
        path: '/users',
        handler: (request, h) => handler.postUserHandler(request, h),
    },
];
module.exports = routes;