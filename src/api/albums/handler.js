module.exports = class AlbumsHandler {
  constructor(service, validator, storageService, uploadsValidator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsByIdHandler = this.getAlbumsByIdHandler.bind(this);
    this.putAlbumById = this.putAlbumById.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    this._renderResponse = this._renderResponse.bind(this);
  }

  async postAlbumHandler(req, h) {
    this._validator.validateAlbumPayload(req.payload);
    const {name, year} = req.payload;
    const albumId = await this._service.addAlbum({name, year});

    return this._renderResponse(h, {
      data: {albumId},
      statusCode: 201,
    });
  }

  async getAlbumsByIdHandler(req, h) {
    const {id} = req.params;
    const album = await this._service.getAlbumById(id);

    return this._renderResponse(h, {
      data: {album},
    });
  }

  async putAlbumById(req, h) {
    const {id} = req.params;
    this._validator.validateAlbumPayload(req.payload);
    const {name, year} = req.payload;
    await this._service.editAlbumById(id, {name, year});

    return this._renderResponse(h, {
      msg: 'success to update album',
    });
  }

  async deleteAlbumByIdHandler(req, h) {
    const {id} = req.params;
    await this._service.deleteAlbumById(id);

    return this._renderResponse(h, {
      msg: 'success to delete album',
    });
  }

  async postCoverAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    await this._uploadsValidator.validateImageHeaders(cover.hapi.headers);
    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;

    await this._service.editCoverAlbumById(id, coverUrl);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });
    response.code(201);
    return response;
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);
    await this._service.verifyLikeAlbumById(albumId, credentialId);
    await this._service.addLikeAlbumById(albumId, credentialId);

    const response = h.response({
      status: "success",
      message: "Like album berhasil ditambahkan",
    });
    response.code(201);
    return response;
  }

  async deleteLikeAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLikeAlbumById(id, credentialId);

    const response = h.response({
      status: "success",
      message: "Like album berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  async getLikeAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, cache } = await this._service.getLikeAlbumById(albumId);

    const response = h.response({
      status: "success",
      data: {
        likes,
      },
    });

    if (cache) response.header("X-Data-Source", "cache");

    response.code(200);
    return response;
  }

  _renderResponse(h, {msg, data, statusCode = 200}) {
    const resObj = {
      status: 'success',
      message: msg,
      data: data,
    };

    if (msg === null) {
      delete resObj['message'];
    }

    if (data === null) {
      delete resObj['data'];
    }

    const res = h.response(resObj);
    res.code(statusCode);

    return res;
  }
};
