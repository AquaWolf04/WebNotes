console.log('Köszönöm hogy a WebNotes alkalmazást használod! 😊')

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
            'undo redo | formatselect | ' +
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

    noteList.innerHTML = notesToRender
        .map(
            (note) => `
<div class="col-md-4 mb-4">
<div class="card card-sm h-100">
<div class="card-header">
<div class="d-flex justify-content-between align-items-center w-100">
<h3 class="card-title text-truncate mb-0" title="${escapeHtml(note.title)}">${escapeHtml(note.title)}</h3>
<div class="card-actions">
  <div class="dropdown">
    <a href="#" class="btn-action" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="ti ti-dots-vertical"></i>
    </a>
    <div class="dropdown-menu dropdown-menu-end">
      <a class="dropdown-item" href="#" onclick="openNoteModal(${note.id})">
        <i class="ti ti-edit icon dropdown-item-icon"></i>
        Szerkesztés
      </a>
      <a class="dropdown-item text-danger" href="#" onclick="deleteNote(${note.id})">
        <i class="ti ti-trash icon dropdown-item-icon"></i>
        Törlés
      </a>
    </div>
  </div>
</div>
</div>
</div>
<div class="card-body d-flex flex-column">
<div class="card-text flex-grow-1 mb-3">
${note.content}
</div>
<div class="mt-auto">
<div class="d-flex justify-content-between align-items-center">
  <div class="text-muted small">
    <i class="ti ti-clock-hour-4 me-1"></i> ${
        note.createdAt ? new Date(note.createdAt).toLocaleDateString('hu-HU') : 'Nincs dátum'
    }
  </div>
</div>
${
    note.tags && note.tags.length > 0
        ? `
    <div class="mt-2">
      ${note.tags
          .map(
              (tag) => `
          <span class="badge bg-primary-lt me-1 mb-1">${escapeHtml(tag)}</span>
        `
          )
          .join('')}
    </div>
    `
        : ''
}
</div>
</div>
</div>
</div>
`
        )
        .join('')
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

    if (!noteForm) {
        console.error('❌ A noteForm nem található!')
        return
    }

    if (noteId) {
        console.log('🔄 Szerkesztés mód')
        noteForm.reset()
        noteForm.removeEventListener('submit', saveNote)
        noteForm.removeEventListener('submit', editNote)
        noteForm.addEventListener('submit', (event) => {
            event.preventDefault()
            console.log('✅ editNote esemény aktiválódott!')
            editNote(event, noteId)
        })
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
        noteForm.removeEventListener('submit', saveNote)
        noteForm.removeEventListener('submit', editNote)
        noteForm.addEventListener('submit', (event) => {
            event.preventDefault()
            console.log('✅ saveNote esemény aktiválódott!')
            saveNote(event)
        })
        console.log('✅ saveNote esemény hozzáadva')

        noteForm.reset()
        noteModal.show()
    }
}

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

async function saveNote(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const content = hugerte.get('noteContent').getContent()
    const tags = formData
        .get('tags')
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

    const noteData = {
        title: formData.get('title'),
        content: content,
        tags: tags,
        createdAt: new Date().toISOString(),
    }

    try {
        const response = await fetch('/notes/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': formData.get('_csrf'),
            },
            body: JSON.stringify({
                notes: JSON.stringify([noteData]),
            }),
        })

        const data = await response.json()

        if (data.status === 'success') {
            await loadNotes()
            noteModal.hide()
            form.reset()
            hugerte.get('noteContent').setContent('')
            //swal whit success button
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
        tags: tags,
    }
    console.log('📌 Küldött adatok:', noteData)

    try {
        const response = await fetch(`/notes/update/${noteId}`, {
            // 🔹 Itt az id helyett noteId kell!
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': formData.get('_csrf'),
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
                        'X-CSRF-Token': document.getElementById('csrf_token').value,
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

document.addEventListener('DOMContentLoaded', function () {
    // Téma preferencia mentése
    const saveTheme = (theme) => {
        localStorage.setItem('theme', theme)
        document.body.setAttribute('data-bs-theme', theme)
    }

    // Témaváltó linkek kezelése
    document.querySelectorAll('[href^="?theme="]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const theme = e.currentTarget.href.includes('dark') ? 'dark' : 'light'
            saveTheme(theme)
        })
    })

    // Mentett téma betöltése
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.body.setAttribute('data-bs-theme', savedTheme)
})
