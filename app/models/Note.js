const { DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const User = require('./User')

const Note = sequelize.define(
    'Note',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        iv: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isPinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
        tableName: 'notes',
    }
)

// Kapcsolat beállítása

User.hasMany(Note, { foreignKey: 'user_id' })
Note.belongsTo(User, { foreignKey: 'user_id' })

module.exports = Note
