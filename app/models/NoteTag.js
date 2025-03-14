const { DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Note = require('./Note')
const Tag = require('./Tag')

const NoteTag = sequelize.define('NoteTag', {}, { timestamps: false, tableName: 'note_tags' })

// **Kapcsolatok beállítása**
Note.belongsToMany(Tag, {
    through: NoteTag,
    foreignKey: 'note_id',
    onDelete: 'CASCADE',
})
Tag.belongsToMany(Note, {
    through: NoteTag,
    foreignKey: 'tag_id',
    onDelete: 'CASCADE',
})

module.exports = NoteTag
