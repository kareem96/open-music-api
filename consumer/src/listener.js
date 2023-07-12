class Listener {
    constructor(service, sender){
        this._service = service;
        this._sender = sender;
        this.listen = this.listen.bind(this);
    }
    async listen(message){
        try {
            const {targetEmail, playlistId} = JSON.parse(message.content.toString());
            const playlistInfo = await this._service.getPlaylistInfo(playlistId);
            const songs = await this._service.getPlaylist(playlistId);
            const playlist = {
                playlist:{
                    id: playlistInfo.id,
                    name: playlistInfo.name,
                    songs
                }
            }
            const result = await this._sender.sendEmail(targetEmail, JSON.stringify(playlist));
            console.log(result);
        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = Listener;