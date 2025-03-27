const { DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const User = require('./User')

const EmailChangeCode = sequelize.define(
    'email_change_codes',
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
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        used: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: 'email_change_codes',
    }
)

User.hasMany(EmailChangeCode, { foreignKey: 'user_id' })
EmailChangeCode.belongsTo(User, { foreignKey: 'user_id' })

module.exports = EmailChangeCode
