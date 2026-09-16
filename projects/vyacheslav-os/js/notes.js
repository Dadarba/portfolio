// =========================================================
// ВЯЧЕСЛАВ OS: ЗАМЕТКИ С ПОИСКОМ, ЗАКРЕПАМИ И СЧЕТЧИКОМ
// =========================================================

(function() {
    let notes = JSON.parse(localStorage.getItem('v_os_notes') || '[]');
    let activeNoteId = null;

    if (notes.length === 0) {
        notes = [{
            id: Date.now(),
            title: 'Добро пожаловать!',
            body: 'Это ваши личные кибер-заметки. Вы можете создавать списки задач, сохранять идеи и закреплять важное.',
            pinned: true,
            updated: Date.now()
        }];
        localStorage.setItem('v_os_notes', JSON.stringify(notes));
    }

    function saveNotes() {
        localStorage.setItem('v_os_notes', JSON.stringify(notes));
    }

    window.renderNotesUI = function(searchQuery = '') {
        const listEl = document.getElementById('notes-list');
        if (!listEl) return;

        let filtered = notes.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
        }

        listEl.innerHTML = filtered.map(n => `
            <div class="note-card ${n.id === activeNoteId ? 'active' : ''}" onclick="selectNote(${n.id})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="font-size:12px; color:${n.id === activeNoteId ? 'var(--accent)' : '#fff'};">${n.title || 'Без названия'}</b>
                    ${n.pinned ? '<span style="color:#ffd700; font-size:11px;">★</span>' : ''}
                </div>
                <div style="font-size:10px; color:var(--text-dim); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${n.body || 'Пустая заметка...'}
                </div>
            </div>
        `).join('');

        if (!activeNoteId && filtered.length > 0) {
            selectNote(filtered[0].id);
        }
    };

    window.selectNote = function(id) {
        activeNoteId = id;
        const note = notes.find(n => n.id === id);
        const titleInp = document.getElementById('note-title');
        const bodyInp = document.getElementById('note-body');
        const pinEl = document.getElementById('note-pin');
        const metaEl = document.getElementById('note-meta');

        if (!note) return;
        if (titleInp) titleInp.value = note.title;
        if (bodyInp) bodyInp.value = note.body;
        if (pinEl) pinEl.innerText = note.pinned ? '★' : '☆';
        if (metaEl) metaEl.innerText = `Символов: ${note.body.length}`;

        document.querySelectorAll('.note-card').forEach(el => el.classList.remove('active'));
        window.renderNotesUI();
    };

    window.updateActiveNote = function() {
        const note = notes.find(n => n.id === activeNoteId);
        if (!note) return;

        const titleInp = document.getElementById('note-title');
        const bodyInp = document.getElementById('note-body');
        const metaEl = document.getElementById('note-meta');

        note.title = titleInp ? titleInp.value : '';
        note.body = bodyInp ? bodyInp.value : '';
        note.updated = Date.now();

        if (metaEl) metaEl.innerText = `Символов: ${note.body.length}`;
        saveNotes();
        window.renderNotesUI();
    };

    window.createNewNote = function() {
        const newNote = {
            id: Date.now(),
            title: 'Новая заметка',
            body: '',
            pinned: false,
            updated: Date.now()
        };
        notes.unshift(newNote);
        saveNotes();
        selectNote(newNote.id);
        if (window.notify) window.notify("+ Создана новая заметка");
    };

    window.togglePinNote = function() {
        const note = notes.find(n => n.id === activeNoteId);
        if (!note) return;
        note.pinned = !note.pinned;
        saveNotes();
        selectNote(note.id);
    };

    window.deleteActiveNote = function() {
        if (!activeNoteId) return;
        notes = notes.filter(n => n.id !== activeNoteId);
        saveNotes();
        activeNoteId = notes.length > 0 ? notes[0].id : null;
        if (notes.length === 0) window.createNewNote();
        else selectNote(activeNoteId);
        if (window.notify) window.notify("Заметка удалена");
    };

    window.copyNoteText = function() {
        const bodyInp = document.getElementById('note-body');
        if (bodyInp && navigator.clipboard) {
            navigator.clipboard.writeText(bodyInp.value).then(() => {
                if (window.notify) window.notify("Текст скопирован в буфер 📋");
            });
        }
    };

    window.filterNotes = function() {
        const q = document.getElementById('note-search')?.value || '';
        window.renderNotesUI(q);
    };

    document.addEventListener('DOMContentLoaded', () => { window.renderNotesUI(); });
})();
