const { nanoid } = require('nanoid');

class NoteService {
  constructor() {
    this._notes = [];
  }

  // addnote handler
  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      title, tags, body, id, createdAt, updatedAt
    };

    this._notes.push(newNote);

    const isSucces = this._notes.filter((note) => note.id === id).length > 0;

    if (!isSucces) {
      throw new Error('Catatan gagal ditambahkan');
    }

    return id;
  }

  // getAll notes
  getAllNote() {
    return this._notes;
  }

  // getNote by id handler
  getNoteById(id) {
    const note = this._notes.filter((note) => note.id === id)[0];
    if (!note) {
      throw new Error('Catatan tidak ditemukan');
    }
    return note;
  }

  // Edit note by id handler
  editNoteById(id, { title, body, tags }) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Gagal memperbarui catatn. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    this._notes[index] = {
      ...this._notes[index],
      title,
      body,
      tags,
      updatedAt
    };
  }

  // delete note by id handler
  deleteNoteById(id) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Catatan gagal dihapus. Id tidak ditemukan');
    }

    this._notes.splice(index, 1);
  }
}

module.exports = NoteService;