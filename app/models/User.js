const { DataTypes } = require('sequelize')
const sequelize = require('../../config/database')

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user', 'pro'),
            allowNull: false,
            defaultValue: 'user',
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'createdAt',
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updatedAt',
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deletedAt',
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: 'users',
    }
)

module.exports = User
