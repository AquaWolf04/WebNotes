const sequelize = require('../../config/database')
const User = require('./User')
const Note = require('./Note')
const Tag = require('./Tag')
const NoteTag = require('./NoteTag')

// **Kapcsolatok beállítása**
User.hasMany(Note, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Note.belongsTo(User, { foreignKey: 'user_id' })

Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'note_id', onDelete: 'CASCADE' })
Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tag_id', onDelete: 'CASCADE' })

module.exports = {
    sequelize,
    User,
    Note,
    Tag,
    NoteTag,
}
