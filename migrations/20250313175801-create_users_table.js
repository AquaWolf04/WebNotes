'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            username: {
                type: Sequelize.STRING(100),
                unique: true,
            },
            email: {
                type: Sequelize.STRING(100),
                unique: true,
            },
            password: {
                type: Sequelize.STRING(255),
            },
            role: {
                type: Sequelize.ENUM('admin', 'user', 'pro'),
                defaultValue: 'user',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            deletedAt: {
                type: Sequelize.DATE,
            },
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users')
    },
}
