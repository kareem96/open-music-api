const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exception/InvariantError");

class CollaborationsService{
    constructor(){
        this._pool = new Pool();
    }

    async addCollaboration(playlistId, userId){
        const id = `collab-${nanoid(16)}`;
        const query = {
            text: 'insert into collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };
        const {rows} = await this._pool.query(query);
        if(!rows.length){
            throw new InvariantError('Gagal menambahkan kollaborasi');
        }
        return rows[0].id;
    }

    async deleteCollaborations(playlistId,  userId){
        const query = {
            text: 'delete from collaborations where playlist_id = $1 and user_id = $2 RETURNING id',
            values: [playlistId, userId],
        }

        const result = await this._pool.query(query);
        if(!result.rowCount){
            throw new InvariantError('Kollaborasi gagal dihapus');
        }
    }

    async verifyCollaborations(playlistId, userId){
        const query =  await this._pool.query({
            text: 'select * from collaborations where playlist_id = $1 and user_id = $2',
            values: [playlistId, userId],
        })
        if(!query.rows.length){
            throw new InvariantError('Kollaborasi gagal diverifikasi');
        }
    }
};
module.exports = CollaborationsService;