const { Note, Tag, NoteTag } = require('../models')
const { Op } = require('sequelize')

const save = async (req, res) => {
    const { notes } = req.body
    const user = req.session.user

    if (!user || !user.id) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    if (!notes) {
        return res.status(400).json({ status: 'error', message: 'Notes are required' })
    }

    try {
        const decodedNotes = JSON.parse(notes)
        if (decodedNotes.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Notes are required' })
        }

        for (const noteData of decodedNotes) {
            const newNote = await Note.create({
                user_id: user.id,
                title: noteData.title,
                content: noteData.content,
                creation_date: noteData.createdAt,
                modification_date: noteData.createdAt,
            })

            if (noteData.tags && noteData.tags.length > 0) {
                const tagNames = noteData.tags.map((tag) => tag.trim())

                // Új tag-ek létrehozása, ha még nem léteznek
                const tags = await Promise.all(
                    tagNames.map(async (tagName) => {
                        const [tag] = await Tag.findOrCreate({ where: { name: tagName } })
                        return tag
                    })
                )

                // Kapcsolatok mentése a NoteTag táblába
                await newNote.addTags(tags)
            }
        }

        res.status(201).json({ status: 'success', message: 'Notes saved successfully' })
    } catch (error) {
        console.error('Save notes error:', error)
        res.status(500).json({ status: 'error', message: 'Failed to save notes' })
    }
}

const list = async (req, res) => {
    const user = req.session.user

    if (!user || !user.id) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    try {
        const notes = await Note.findAll({
            where: { user_id: user.id },
            include: [
                {
                    model: Tag,
                    attributes: ['name'],
                    through: { attributes: [] }, // Kapcsolótáblát ne hozza vissza
                },
            ],
        })

        const formattedNotes = notes.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.Tags.map((tag) => tag.name),
            createdAt: note.creation_date,
            updatedAt: note.modification_date,
        }))

        res.status(200).json({ status: 'success', notes: formattedNotes })
    } catch (error) {
        console.error('List notes error:', error)
        res.status(500).json({ status: 'error', message: 'Failed to list notes' })
    }
}

module.exports = {
    save,
    list,
}
