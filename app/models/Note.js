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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        creation_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        modification_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: 'note',
    }
)

// Kapcsolat beállítása
User.hasMany(Note, { foreignKey: 'user_id' })
Note.belongsTo(User, { foreignKey: 'user_id' })

module.exports = Note
