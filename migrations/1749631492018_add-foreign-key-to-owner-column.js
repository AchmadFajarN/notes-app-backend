/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
/* eslint-disable camelcase */
exports.up = (pgm) => {
  // membuat user baru
  pgm.sql(
    "INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old_notes')"
  );

  // mengubah nilai owner jika kosong
  pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner IS NULL");

  // memberikan constrain foreign key pada owner terhadap id user
  pgm.addConstraint(
    'notes', 'fk_notes.owner_user.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('notes', 'fk_notes.owner_user.id');
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
