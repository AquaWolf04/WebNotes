console.log('Köszönöm hogy a WebNotes alkalmazást használod! 😊')

document.addEventListener('focusin', function (e) {
    if (
        e.target.closest(
            '.tox-hugerte-aux, .moxman-window, .tam-assetmanager-root, .hugerte, .hugerte-modal, .hugerte-dialog'
        ) !== null
    ) {
        e.stopImmediatePropagation()
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const tagInput = document.getElementById('tagInput')
    const tagContainer = document.getElementById('tag-container')
    const hiddenTags = document.getElementById('hiddenTags')
    let tags = []

    function updateHiddenInput() {
        hiddenTags.value = tags.join(',')
    }

    function createTagElement(tag) {
        const tagElement = document.createElement('div')
        tagElement.classList.add('badge', 'bg-primary', 'me-1', 'p-2', 'text-white')
        tagElement.textContent = tag

        const removeBtn = document.createElement('span')
        removeBtn.textContent = ' ✖'
        removeBtn.style.cursor = 'pointer'
        removeBtn.onclick = () => {
            tags = tags.filter((t) => t !== tag)
            updateHiddenInput()
            tagElement.remove()
        }

        tagElement.appendChild(removeBtn)
        tagContainer.appendChild(tagElement)
    }

    function updateTagUI() {
        tagContainer.innerHTML = '' // Előző címkék törlése

        if (hiddenTags.value.trim() !== '') {
            tags = hiddenTags.value.split(',').map((tag) => tag.trim()) // Betölti a korábbi címkéket
        } else {
            tags = [] // Ha nincs címke, ürítjük a listát
        }

        tags.forEach(createTagElement)
        updateHiddenInput()
    }

    tagInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            const tag = tagInput.value.trim()
            if (tag && !tags.includes(tag)) {
                tags.push(tag)
                createTagElement(tag)
                updateHiddenInput()
            }
            tagInput.value = ''
        }
    })

    tagInput.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && tagInput.value === '' && tags.length > 0) {
            const lastTag = tags.pop()
            updateHiddenInput()
            ;[...tagContainer.getElementsByClassName('badge')].pop().remove()
        }
    })

    // Amikor megnyílik a modal
    document.getElementById('noteModal').addEventListener('show.bs.modal', (event) => {
        updateTagUI() // Mindig frissíti a címkéket a meglévő hidden input alapján
    })
})
document.addEventListener('DOMContentLoaded', function () {
    let options = {
        selector: '#noteContent',
        height: 300,
        language: 'hu_HU',
        menubar: true,
        statusbar: false,
        license_key: 'gpl',
        plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
        ],
        toolbar:
            'undo redo | fullscreen | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat',
        content_style:
            'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; -webkit-font-smoothing: antialiased; }',
    }
    if (localStorage.getItem('theme') === 'dark') {
        options.skin = 'oxide-dark'
        options.content_css = 'dark'
    }
    hugerte.init(options)
})

let notes = []
const noteModal = new bootstrap.Modal(document.getElementById('noteModal'))

document.addEventListener('DOMContentLoaded', () => {
    loadNotes()
    initSearchHandler()
})

async function loadNotes() {
    try {
        const response = await fetch('/notes/list')
        const data = await response.json()

        if (data.status === 'success') {
            notes = data.notes
            renderNotes(notes)
        } else {
            showError('Hiba történt a jegyzetek betöltésekor')
        }
    } catch (error) {
        showError('Nem sikerült kapcsolódni a szerverhez')
    }
}

function renderNotes(notesToRender) {
    const noteList = document.getElementById('noteList')

    if (notesToRender.length === 0) {
        noteList.innerHTML = `
            <div class="col-12">
                <div class="card card-body text-center">
                    <h3>Nincsenek jegyzetek</h3>
                    <p class="text-muted">Hozz létre egy új jegyzetet a "+ Új jegyzet" gombbal!</p>
                </div>
            </div>`
        return
    }

    // Kiemelt jegyzetek előre kerülnek
    notesToRender.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

    noteList.innerHTML = notesToRender
        .map((note) => {
            let cardClass = 'card note-card h-100'
            let highlightBadge = ''

            if (note.isPinned && note.isImportant) {
                cardClass += ' border-gradient-red-gold'
                highlightBadge += `
                    <span class="badge highlight-badge bg-gradient-warning me-1">
                        <i class="ti ti-pin"></i> Kiemelt
                    </span>
                    <span class="badge highlight-badge bg-gradient-danger">
                        <i class="ti ti-alert-circle"></i> Fontos
                    </span>`
            } else if (note.isPinned) {
                cardClass += ' border-gradient-gold'
                highlightBadge += `<span class="badge highlight-badge bg-gradient-warning">
                    <i class="ti ti-pin"></i> Kiemelt
                </span>`
            } else if (note.isImportant) {
                cardClass += ' border-gradient-red'
                highlightBadge += `<span class="badge highlight-badge bg-gradient-danger">
                    <i class="ti ti-alert-circle"></i> Fontos
                </span>`
            }

            return `
                <div onclick="openasd(${note.id})" class="col-md-4 mb-4">
                    <div class="${cardClass}">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="card-title text-truncate mb-0" title="${escapeHtml(note.title)}">
                                ${escapeHtml(note.title)}
                            </h3>
                            <div class="card-actions">
                                <div class="dropdown" onclick="event.stopPropagation();">
                                    <a href="#" class="btn-action" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="ti ti-dots-vertical"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-end">
                                        <a class="dropdown-item" href="#" onclick="openNoteModal(${note.id})">
                                            <i class="ti ti-edit icon dropdown-item-icon"></i> Szerkesztés
                                        </a>
                                        <a class="dropdown-item" href="#" onclick="shareModal(${note.id})">
                                            <i class="ti ti-share icon dropdown-item-icon"></i> Megosztás
                                        </a>
                                        <a class="dropdown-item text-danger" href="#" onclick="deleteNote(${note.id})">
                                            <i class="ti ti-trash icon dropdown-item-icon"></i> Törlés
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="card-text flex-grow-1 mb-3">
                                ${note.content}
                            </div>
                            <div class="mt-auto">
                                ${
                                    note.tags && note.tags.length > 0
                                        ? `<div class="tags-container">
                                            ${note.tags
                                                .map((tag) => `<span class="badge tag-badge">${escapeHtml(tag)}</span>`)
                                                .join('')}
                                        </div>`
                                        : ''
                                }
                            </div>
                            <div class="note-meta">
                                <div class="small">
                                    <i class="ti ti-calendar-event me-1"></i> 
                                    ${
                                        note.createdAt
                                            ? new Date(note.createdAt).toLocaleDateString('hu-HU')
                                            : 'Nincs dátum'
                                    }
                                </div>
                                <div>${highlightBadge}</div>
                            </div>
                        </div>
                    </div>
                </div>`
        })
        .join('')
}

function openasd(s) {
    //ajax request to get note
    $.ajax({
        url: '/notes/finbyid/' + s,
        type: 'GET',
        success: function (data) {
            console.log(data)
        },
        error: function (error) {
            console.log(error)
        },
    })
}

function initSearchHandler() {
    const searchInput = document.getElementById('searchInput')
    let timeoutId

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase()
            const filteredNotes = notes.filter(
                (note) =>
                    note.title.toLowerCase().includes(searchTerm) ||
                    note.content.toLowerCase().includes(searchTerm) ||
                    note.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
            )
            renderNotes(filteredNotes)
        }, 300)
    })
}

function openNoteModal(noteId = null) {
    const noteForm = document.getElementById('noteForm')
    let title = document.getElementById('title')

    if (!noteForm) {
        console.error('❌ A noteForm nem található!')
        return
    }

    // Új form submit esemény beállítása előtt eltávolítjuk az esetleg már meglévőt
    noteForm.removeEventListener('submit', handleNoteSubmit)

    if (noteId) {
        console.log('🔄 Szerkesztés mód')
        title.innerHTML = '<i class="ti ti-edit me-2"></i> Jegyzet szerkesztése'
        noteForm.reset()

        // Új eseménykezelő a szerkesztéshez
        handleNoteSubmit = (event) => {
            event.preventDefault()
            console.log('✅ editNote esemény aktiválódott!')
            editNote(event, noteId)
        }
        noteForm.addEventListener('submit', handleNoteSubmit)
        console.log('✅ editNote esemény hozzáadva')

        fetch(`/notes/finbyid/${noteId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Hiba a betöltéskor: ${response.status}`)
                }
                return response.json()
            })
            .then((data) => {
                if (data.status === 'success') {
                    const note = data.note
                    document.getElementById('noteTitle').value = note.title
                    document.getElementById('noteId').value = note.id

                    if (note.isPinned) {
                        document.getElementById('notePinned').checked = true
                    } else {
                        document.getElementById('notePinned').checked = false
                    }

                    if (hugerte.get('noteContent')) {
                        hugerte.get('noteContent').setContent(note.content)
                    } else {
                        document.getElementById('noteContent').value = note.content
                    }

                    updateTagUI(note.tags)
                    noteModal.show()
                } else {
                    showError('Nem sikerült betölteni a jegyzetet')
                }
            })
            .catch((error) => {
                console.error('Hiba történt:', error)
                showError('Nem sikerült betölteni a jegyzetet')
            })
    } else {
        console.log('➕ Új jegyzet mód')
        title.innerHTML = '<i class="ti ti-plus me-2"></i> Új jegyzet létrehozása'
        noteForm.reset()

        // Új eseménykezelő a mentéshez
        handleNoteSubmit = (event) => {
            event.preventDefault()
            console.log('✅ saveNote esemény aktiválódott!')
            saveNote(event)
        }
        noteForm.addEventListener('submit', handleNoteSubmit)
        console.log('✅ saveNote esemény hozzáadva')

        noteModal.show()
    }
}

// Eseménykezelő referencia
let handleNoteSubmit = null

function updateTagUI(tags) {
    const tagContainer = document.getElementById('tag-container')
    const hiddenTags = document.getElementById('hiddenTags')

    // Előző címkék törlése
    tagContainer.innerHTML = ''

    // Új címkék hozzáadása
    tags.forEach((tag, index) => {
        const tagElement = document.createElement('span')
        tagElement.classList.add('badge', 'bg-primary', 'me-1', 'p-2', 'text-white')
        tagElement.textContent = tag

        const removeBtn = document.createElement('span')
        removeBtn.textContent = ' ✖'
        removeBtn.style.cursor = 'pointer'
        removeBtn.onclick = () => {
            tags.splice(index, 1) // Eltávolítjuk az elemet a tömbből
            updateTagUI(tags) // Frissítjük a UI-t
        }

        tagElement.appendChild(removeBtn)
        tagContainer.appendChild(tagElement)
    })

    // Frissítsük a hidden inputot a backend számára
    hiddenTags.value = tags.join(', ')
}

// Címkék törlése (új jegyzet létrehozásakor)
function resetTags() {
    updateTagUI([]) // Kiüríti a tageket
}

// Modal megnyitás eseményfigyelője
document.getElementById('noteModal').addEventListener('show.bs.modal', function (event) {
    const noteId = document.getElementById('noteId').value
    console.log('🆔 Jegyzet ID:', noteId)

    if (noteId) {
        // Ha van noteId, akkor szerkesztünk, tehát betöltjük a meglévő tageket
        const hiddenTags = document.getElementById('hiddenTags').value
        const tags = hiddenTags ? hiddenTags.split(',').map((tag) => tag.trim()) : []
        updateTagUI(tags)
    } else {
        // Ha nincs noteId, akkor új jegyzet jön létre, tehát töröljük a címkéket
        resetTags()
    }
})

async function saveNote(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const hiddenTags = document.getElementById('hiddenTags').value // 📌 Címkék a hidden inputból

    const noteData = {
        title: formData.get('title'),
        content: hugerte.get('noteContent').getContent(),
        isPinned: formData.get('isPinned') === 'on',
        tags: hiddenTags
            ? hiddenTags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0) // 📌 Töröljük az üres címkéket
            : [],
        createdAt: new Date().toISOString(),
    }

    console.log('📩 Küldött noteData:', JSON.stringify(noteData, null, 2)) // 📌 Debugging

    try {
        const response = await fetch('/notes/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: JSON.stringify(noteData),
        })

        const data = await response.json()

        if (data.status === 'success') {
            await loadNotes()
            noteModal.hide()
            form.reset()
            document.getElementById('hiddenTags').value = '' // 📌 Címkék törlése új jegyzetnél
            hugerte.get('noteContent').setContent('')
            Swal.fire({
                icon: 'success',
                title: 'Jegyzet mentve!',
                showConfirmButton: false,
                timer: 1500,
            })
        } else {
            Toast.fire({
                icon: 'error',
                title: 'Nem sikerült menteni a jegyzetet',
            })
        }
    } catch (error) {
        console.error(error)
        Toast.fire({
            icon: 'error',
            title: 'Nem sikerült menteni a jegyzetet',
        })
    }
}

async function editNote(event, noteId) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const content = hugerte.get('noteContent').getContent()
    const tags = formData
        .get('tags')
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

    if (!noteId) {
        console.error('❌ Hiba: noteId nincs megadva!')
        showError('Nem sikerült frissíteni a jegyzetet: nincs azonosító.')
        return
    }

    const noteData = {
        title: formData.get('title'),
        content: content,
        isPinned: formData.get('isPinned') === 'on',
        tags: tags,
    }
    console.log('📌 Küldött adatok:', noteData)

    try {
        const response = await fetch(`/notes/update/${noteId}`, {
            // 🔹 Itt az id helyett noteId kell!
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: JSON.stringify(noteData),
        })

        const data = await response.json()
        console.log('📩 Szerver válasza:', data)

        if (data.status === 'success') {
            await loadNotes()
            noteModal.hide()
            form.reset()
            hugerte.get('noteContent').setContent('')
            showSuccess('A jegyzet frissítve lett!')
        } else {
            showError('Nem sikerült frissíteni a jegyzetet')
        }
    } catch (error) {
        console.error('🚨 Fetch hiba:', error)
        showError('Nem sikerült frissíteni a jegyzetet')
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function showSuccess(message) {
    Toast.fire({
        icon: 'success',
        title: message,
    })
}

function showError(message) {
    Toast.fire({
        icon: 'error',
        title: message,
    })
}

function deleteNote(id) {
    Swal.fire({
        title: 'Biztos vagy benne?',
        text: 'A jegyzet törölve lesz és nem lehet visszavonni!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Igen, töröld!',
        cancelButtonText: 'Mégse',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/notes/delete/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                })

                const data = await response.json()

                if (data.status === 'success') {
                    await loadNotes()
                    showSuccess('A jegyzet törölve lett!')
                } else {
                    showError('Nem sikerült törölni a jegyzetet')
                }
            } catch (error) {
                showError('Nem sikerült törölni a jegyzetet')
            }
        }
    })
}
