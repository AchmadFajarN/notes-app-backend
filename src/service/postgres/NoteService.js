const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exeptions/InvariantError');
const NotFoundError = require('../../exeptions/NotFoundError');
const AuthorizationError = require('../../exeptions/AuthorizationError');
const { mapDBToModel } = require('../../utils');

class NoteService {
  constructor() {
    this._pool = new Pool();
  }

  // Menambah catatan ke database
  async addNote({ title, body, tags, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  // Mengakses semua catatan di database
  async getAllNote(owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE owner = $1',
      values: [owner]
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }


  // Mendapatkan catatan berdasarkan id
  async getNoteById(id) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id]
    };
    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows[0];
  }

  // Mengedit catatan berdasarkan id
  async editNoteById(id, { title, body, tags }) {
    const updateAt = new Date().toISOString();
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updateAt, id]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
  }

  // verify note owner
  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const note = result.rows[0];

    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = NoteService;