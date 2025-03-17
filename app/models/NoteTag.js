const { DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Note = require('./Note')
const Tag = require('./Tag')

// NoteTag tábla létrehozása (köztes tábla a many-to-many kapcsolathoz)
const NoteTag = sequelize.define(
    'NoteTag',
    {},
    {
        timestamps: false,
        tableName: 'note_tags',
        indexes: [
            {
                unique: true,
                fields: ['note_id', 'tag_id'], // Megakadályozza a duplikációt
            },
        ],
    }
)
// Modul exportálása
module.exports = NoteTag
