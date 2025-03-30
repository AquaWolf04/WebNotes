const { Note, Tag, User, NoteTag } = require('../models')
const logger = require('../../utils/logger')
const { encryptJSON, decryptJSON } = require('../../utils/aesUtils')

// Jegyzet mentése
const save = async (req, res) => {
    try {
        //console.log('📩 Beérkező body:', req.body)

        const noteData = req.body

        if (!noteData.title || !noteData.content) {
            return res.status(400).json({
                status: 'error',
                message: 'Cím illetve tartalom megadása kötelező',
            })
        }

        const userId = req.session.userId
        if (!userId) {
            return res
                .status(401)
                .json({ status: 'error', message: 'Unauthorized' })
        }

        const user = await User.findByPk(userId)

        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', message: 'Unauthorized' })
        }

        const encrypted = encryptJSON({
            content: noteData.content,
            createdAt: new Date().toISOString(),
        })

        const note = await Note.create({
            user_id: userId,
            title: noteData.title,
            content: encrypted.content, // titkosított content
            iv: encrypted.iv, // inicializációs vektor külön mezőbe
            isPinned: noteData.isPinned ? 1 : 0,
            isImportant: noteData.isImportant ? 1 : 0,
        })

        if (noteData.tags) {
            const tagNames = noteData.tags.map((tag) => tag.trim())
            const existingTags = await Tag.findAll({
                where: { name: tagNames },
            })
            const existingTagNames = existingTags.map((tag) => tag.name)
            const newTags = tagNames.filter(
                (tag) => !existingTagNames.includes(tag)
            )

            const createdTags = await Tag.bulkCreate(
                newTags.map((name) => ({ name })),
                { returning: true }
            )
            const allTags = [...existingTags, ...createdTags]

            const noteTags = allTags.filter((tag) =>
                tagNames.includes(tag.name)
            )
            await note.setTags(noteTags)
        }

        res.status(201).json({
            status: 'success',
            message: 'Note saved successfully',
        })
    } catch (error) {
        logger.error('Save note error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to save note',
        })
    }
}

// Jegyzetek listázása
const list = async (req, res) => {
    const userId = req.session.userId

    if (!userId) {
        return res
            .status(401)
            .json({ status: 'error', message: 'Unauthorized' })
    }

    try {
        const notes = await Note.findAll({
            where: { user_id: userId },
            attributes: [
                'id',
                'title',
                'content',
                'iv',
                'createdAt',
                'updatedAt',
                'isPinned',
            ],
            include: [
                {
                    model: Tag,
                    attributes: ['name'],
                    through: { attributes: [] },
                },
            ],
        })

        const formattedNotes = notes.map((note) => {
            let decryptedContent = ''
            try {
                decryptedContent = decryptJSON({
                    content: note.content,
                    iv: note.iv,
                }).content
            } catch (err) {
                decryptedContent = '[Hibás titkosított tartalom]'
            }

            return {
                id: note.id,
                title: note.title,
                content: decryptedContent,
                tags: note.Tags.map((tag) => tag.name),
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                isPinned: note.isPinned,
            }
        })

        res.status(200).json({ status: 'success', notes: formattedNotes })
    } catch (error) {
        console.error('List notes error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to list notes',
        })
    }
}

// Jegyzet szerkesztése
const edit = async (req, res) => {
    try {
        const noteId = req.params.id
        const { title, content, tags, isPinned } = req.body

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })
        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', message: 'Unauthorized' })
        }

        const note = await Note.findByPk(noteId)
        if (!note || note.user_id !== user.id) {
            return res
                .status(404)
                .json({ status: 'error', message: 'Note not found' })
        }

        note.title = title
        const encrypted = encryptJSON({
            content: content,
            updatedAt: new Date().toISOString(),
        })
        note.content = encrypted.content
        note.iv = encrypted.iv
        note.updatedAt = new Date()
        note.isPinned = isPinned
        await note.save()

        if (tags) {
            const tagNames = tags.map((tag) => tag.trim())
            const existingTags = await Tag.findAll({
                where: { name: tagNames },
            })
            const existingTagNames = existingTags.map((tag) => tag.name)
            const newTags = tagNames.filter(
                (tag) => !existingTagNames.includes(tag)
            )

            const createdTags = await Tag.bulkCreate(
                newTags.map((name) => ({ name })),
                { returning: true }
            )
            const allTags = [...existingTags, ...createdTags]

            const noteTags = allTags.filter((tag) =>
                tagNames.includes(tag.name)
            )
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

// Jegyzet betöltése ID alapján
const loadbyid = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id)) {
            return res
                .status(400)
                .json({ status: 'error', message: 'Invalid note ID' })
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })

        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', message: 'Unauthorized' })
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
            return res
                .status(404)
                .json({ status: 'error', message: 'Note not found' })
        }

        let decryptedContent = ''
        try {
            decryptedContent = decryptJSON({
                content: note.content,
                iv: note.iv,
            }).content
        } catch (err) {
            decryptedContent = '[Hibás titkosított tartalom]'
        }

        res.status(200).json({
            status: 'success',
            note: {
                id: note.id,
                title: note.title,
                content: decryptedContent,
                tags: note.Tags.map((tag) => tag.name),
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                isPinned: note.isPinned,
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

// Jegyzet törlése ID alapján
const remove = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id)) {
            return res
                .status(400)
                .json({ status: 'error', message: 'Invalid note ID' })
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })

        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', message: 'Unauthorized' })
        }

        const note = await Note.findByPk(id)
        if (!note || note.user_id !== user.id) {
            return res
                .status(404)
                .json({ status: 'error', message: 'Note not found' })
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

const shareInit = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id)) {
            return res
                .status(400)
                .json({ status: 'error', message: 'Invalid note ID' })
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id'],
        })

        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', message: 'Unauthorized' })
        }

        const note = await Note.findByPk(id)
        if (!note || note.user_id !== user.id) {
            return res
                .status(404)
                .json({ status: 'error', message: 'Note not found' })
        }

        res.status(200).json({
            status: 'success',
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                tags: note.Tags.map((tag) => tag.name),
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                isPinned: note.isPinned,
            },
        })
    } catch (error) {
        console.error('Share init error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to initialize share',
        })
    }
}

module.exports = {
    save,
    list,
    edit,
    loadbyid,
    remove,
    shareInit,
}
