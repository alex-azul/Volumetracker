// app.js - Lógica principal de la aplicación

const db = new VolumeDB();
let currentView = 'summary';
let currentEditDate = getTodayStr();
let cachedWeekData = {}; // Cache para la semana actual

// Inicializar app
async function init() {
    await db.init();
    setupEventListeners();
    showView('summary');
    await refreshSummary();
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación principal
    document.getElementById('btn-edit-today').addEventListener('click', () => {
        currentEditDate = getTodayStr();
        showView('editor');
    });
    document.getElementById('btn-settings').addEventListener('click', () => showView('settings'));
    document.getElementById('btn-today').addEventListener('click', () => {
        currentEditDate = getTodayStr();
        showView('editor');
    });
    document.getElementById('btn-back').addEventListener('click', () => showView('summary'));
    document.getElementById('btn-back-settings').addEventListener('click', () => showView('summary'));

    // Editor de día
    document.getElementById('date-input').addEventListener('change', (e) => {
        currentEditDate = e.target.value;
        refreshEditor();
    });
    document.getElementById('btn-prev-day').addEventListener('click', () => {
        currentEditDate = addDays(currentEditDate, -1);
        refreshEditor();
    });
    document.getElementById('btn-next-day').addEventListener('click', () => {
        currentEditDate = addDays(currentEditDate, 1);
        refreshEditor();
    });
    document.getElementById('btn-copy-yesterday').addEventListener('click', copyYesterday);
    document.getElementById('btn-clear-day').addEventListener('click', clearCurrentDay);

    // Ajustes
    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('btn-import').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
}

// Mostrar vista
function showView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

    if (viewName === 'summary') {
        document.getElementById('summary-view').classList.remove('hidden');
        refreshSummary();
    } else if (viewName === 'editor') {
        document.getElementById('editor-view').classList.remove('hidden');
        refreshEditor();
    } else if (viewName === 'settings') {
        document.getElementById('settings-view').classList.remove('hidden');
    }
}

// ========== VISTA RESUMEN (7 días) ==========

async function refreshSummary() {
    const today = getTodayStr();
    const dates = getLast7Days(today);
    const entries = await db.getDays(dates);

    // Calcular totales por músculo
    const totals = {};
    MUSCLES.forEach(m => {
        totals[m.id] = 0;
        entries.forEach(entry => {
            if (entry && entry.sets && entry.sets[m.id]) {
                totals[m.id] += entry.sets[m.id];
            }
        });
    });

    // Renderizar lista
    const listEl = document.getElementById('muscle-list');
    listEl.innerHTML = MUSCLES.map(muscle => `
        <div class="muscle-card">
            <div class="muscle-info">
                <span class="muscle-name">${muscle.name}</span>
            </div>
            <div class="muscle-total">${totals[muscle.id]}</div>
        </div>
    `).join('');
}

// ========== VISTA EDITOR DE DÍA ==========

async function refreshEditor() {
    // Actualizar input de fecha
    document.getElementById('date-input').value = currentEditDate;

    // Cargar datos del día
    const entry = await db.getDay(currentEditDate);
    const sets = entry?.sets || {};

    // Renderizar lista de músculos con steppers
    const listEl = document.getElementById('editor-list');
    listEl.innerHTML = MUSCLES.map(muscle => {
        const value = sets[muscle.id] || 0;
        return `
            <div class="editor-row">
                <span class="muscle-name">${muscle.name}</span>
                <div class="stepper">
                    <button class="btn-stepper" data-muscle="${muscle.id}" data-action="dec">−</button>
                    <input type="number"
                           class="stepper-input"
                           data-muscle="${muscle.id}"
                           value="${value}"
                           min="0"
                           step="1" />
                    <button class="btn-stepper" data-muscle="${muscle.id}" data-action="inc">+</button>
                </div>
            </div>
        `;
    }).join('');

    // Event listeners para steppers
    listEl.querySelectorAll('.btn-stepper').forEach(btn => {
        btn.addEventListener('click', handleStepperClick);
    });
    listEl.querySelectorAll('.stepper-input').forEach(input => {
        input.addEventListener('change', handleInputChange);
    });

    updateDayTotal();
}

async function handleStepperClick(e) {
    const muscleId = e.target.dataset.muscle;
    const action = e.target.dataset.action;
    const input = document.querySelector(`input[data-muscle="${muscleId}"]`);
    let value = parseInt(input.value) || 0;

    if (action === 'inc') {
        value++;
    } else if (action === 'dec' && value > 0) {
        value--;
    }

    input.value = value;
    await saveCurrentValue(muscleId, value);
}

async function handleInputChange(e) {
    const muscleId = e.target.dataset.muscle;
    let value = parseInt(e.target.value) || 0;
    if (value < 0) value = 0;
    e.target.value = value;
    await saveCurrentValue(muscleId, value);
}

async function saveCurrentValue(muscleId, value) {
    // Cargar día actual
    const entry = await db.getDay(currentEditDate);
    const sets = entry?.sets || {};

    // Actualizar valor
    sets[muscleId] = value;

    // Guardar
    await db.saveDay(currentEditDate, sets);
    updateDayTotal();
    showToast('✓ Guardado');
}

function updateDayTotal() {
    const inputs = document.querySelectorAll('.stepper-input');
    let total = 0;
    inputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    document.getElementById('day-total').textContent = total;
}

async function copyYesterday() {
    const yesterday = addDays(currentEditDate, -1);
    const entry = await db.getDay(yesterday);

    if (!entry || !entry.sets) {
        showToast('⚠️ No hay datos de ayer');
        return;
    }

    await db.saveDay(currentEditDate, { ...entry.sets });
    refreshEditor();
    showToast('✓ Copiado desde ayer');
}

async function clearCurrentDay() {
    if (!confirm('¿Vaciar todos los valores del día?')) return;

    await db.clearDay(currentEditDate);
    refreshEditor();
    showToast('✓ Día vaciado');
}

// ========== EXPORTAR/IMPORTAR ==========

async function exportData() {
    const data = await db.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `volumetracker-export-${getTodayStr()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('✓ Datos exportados');
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            throw new Error('Formato incorrecto');
        }

        await db.importData(data);
        showToast('✓ Datos importados');
        refreshSummary();
        e.target.value = ''; // Reset input
    } catch (err) {
        showToast('❌ Error al importar: ' + err.message);
    }
}

// ========== UTILIDADES UI ==========

function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Iniciar app cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
