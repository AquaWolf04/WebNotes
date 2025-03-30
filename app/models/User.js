const { DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const bcrypt = require('bcryptjs')

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
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user',
        },
        isPro: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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

User.prototype.validPassword = function (inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password)
}

User.prototype.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

module.exports = User
