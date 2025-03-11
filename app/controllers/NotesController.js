const { Note, Tag, User, NoteTag } = require('../models')
const { Op } = require('sequelize')

const save = async (req, res) => {
    try {
        const { notes } = req.body

        // 🔴 **Ellenőrizzük, hogy a felhasználó be van-e jelentkezve**
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        }

        // 🔴 **Ellenőrizzük, hogy a jegyzetek léteznek és nem üresek**
        if (!notes || (Array.isArray(notes) && notes.length === 0)) {
            return res.status(400).json({ status: 'error', message: 'Notes are required' })
        }

        // 🔵 **Ha a notes JSON stringként érkezik, akkor parsoljuk**
        const decodedNotes = typeof notes === 'string' ? JSON.parse(notes) : notes
        if (!Array.isArray(decodedNotes) || decodedNotes.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Notes are required' })
        }

        // 🟢 **Tömeges jegyzet beszúrás**
        const notesToInsert = decodedNotes.map((note) => ({
            user_id: user.id,
            title: note.title,
            content: note.content,
            creation_date: note.createdAt || new Date(),
            modification_date: note.createdAt || new Date(),
        }))
        const createdNotes = await Note.bulkCreate(notesToInsert, {
            returning: true,
        })

        // 🟢 **Címke (tag) kezelés**
        const tagNames = new Set()
        decodedNotes.forEach((note) => {
            if (note.tags) {
                note.tags.forEach((tag) => tagNames.add(tag.trim()))
            }
        })

        if (tagNames.size > 0) {
            // 🟢 **Létező címkék lekérése és új címkék létrehozása**
            const existingTags = await Tag.findAll({
                where: { name: Array.from(tagNames) },
            })
            const existingTagNames = existingTags.map((tag) => tag.name)
            const newTags = Array.from(tagNames).filter((tag) => !existingTagNames.includes(tag))

            // Csak az új címkéket hozzuk létre
            const createdTags = await Tag.bulkCreate(
                newTags.map((name) => ({ name })),
                { returning: true }
            )
            const allTags = [...existingTags, ...createdTags]

            // 🟢 **Kapcsolatok létrehozása a jegyzetek és címkék között (duplikációk elkerülése)**
            for (let i = 0; i < createdNotes.length; i++) {
                const noteTags = decodedNotes[i].tags.map((tag) => allTags.find((t) => t.name === tag)).filter(Boolean)

                for (const tag of noteTags) {
                    const existingRelation = await createdNotes[i].hasTag(tag)
                    if (!existingRelation) {
                        await createdNotes[i].addTag(tag)
                    }
                }
            }
        }

        res.status(201).json({
            status: 'success',
            message: 'Notes saved successfully',
        })
    } catch (error) {
        console.error('Save notes error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to save notes',
        })
    }
}

const list = async (req, res) => {
    //const user = req.session.userId
    const user = await User.findByPk(req.session.userId, {
        attributes: ['id'],
    })

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
        res.status(500).json({
            status: 'error',
            message: 'Failed to list notes',
        })
    }
}

const edit = async (req, res) => {
    try {
        const { noteId, title, content, tags } = req.body

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        }

        const note = await Note.findByPk(noteId)
        if (!note || note.user_id !== user.id) {
            return res.status(404).json({ status: 'error', message: 'Note not found' })
        }

        note.title = title
        note.content = content
        note.modification_date = new Date()
        await note.save()

        if (tags) {
            const tagNames = tags.map((tag) => tag.trim())
            const existingTags = await Tag.findAll({
                where: { name: tagNames },
            })
            const existingTagNames = existingTags.map((tag) => tag.name)
            const newTags = tagNames.filter((tag) => !existingTagNames.includes(tag))

            const createdTags = await Tag.bulkCreate(
                newTags.map((name) => ({ name })),
                { returning: true }
            )
            const allTags = [...existingTags, ...createdTags]

            const noteTags = allTags.filter((tag) => tagNames.includes(tag.name))
            await note.setTags(noteTags)
        }

        res.status(200).json({
            status: 'success',
            message: 'Note updated successfully',
        })
    } catch (error) {
        console.error('Edit note error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to update note',
        })
    }
}

const loadbyid = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id)) {
            return res.status(400).json({ status: 'error', message: 'Invalid note ID' })
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        }

        const note = await Note.findByPk(id, {
            include: [
                {
                    model: Tag,
                    attributes: ['name'],
                    through: { attributes: [] },
                },
            ],
        })

        if (!note || note.user_id !== user.id) {
            return res.status(404).json({ status: 'error', message: 'Note not found' })
        }

        res.status(200).json({
            status: 'success',
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                tags: note.Tags.map((tag) => tag.name),
                createdAt: note.creation_date?.toISOString() || null,
                updatedAt: note.modification_date?.toISOString() || null,
            },
        })
    } catch (error) {
        console.error('Load note error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to load note',
        })
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id)) {
            return res.status(400).json({ status: 'error', message: 'Invalid note ID' })
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        }

        const note = await Note.findByPk(id)
        if (!note || note.user_id !== user.id) {
            return res.status(404).json({ status: 'error', message: 'Note not found' })
        }

        const noteTags = await NoteTag.findAll({
            where: { note_id: note.id },
        })
        await Promise.all(noteTags.map((noteTag) => noteTag.destroy()))

        await note.destroy()
        res.status(200).json({
            status: 'success',
            message: 'Note deleted successfully',
        })
    } catch (error) {
        console.error('Delete note error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete note',
        })
    }
}

module.exports = {
    save,
    list,
    edit,
    loadbyid,
    remove,
}
