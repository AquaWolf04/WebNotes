'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('note_tags', {
            note_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'notes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tag_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tags',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        })

        // 🔹 Egyedi kulcs biztosítása (megelőzi a duplikációt)
        await queryInterface.addConstraint('note_tags', {
            fields: ['note_id', 'tag_id'],
            type: 'primary key',
            name: 'pk_note_tags',
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('note_tags')
    },
}
