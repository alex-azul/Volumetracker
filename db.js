// db.js - Capa de almacenamiento con IndexedDB

const DB_NAME = 'VolumeTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'days';

// Lista de músculos (orden fijo)
const MUSCLES = [
    { id: 'antebrazo', name: 'Antebrazo' },
    { id: 'biceps', name: 'Bíceps' },
    { id: 'triceps', name: 'Tríceps' },
    { id: 'hombro_lateral', name: 'Hombro Lateral' },
    { id: 'hombro_delantero', name: 'Hombro Delantero' },
    { id: 'pecho', name: 'Pecho' },
    { id: 'abs', name: 'Abs' },
    { id: 'dorsal', name: 'Dorsal' },
    { id: 'trapecio', name: 'Trapecio' },
    { id: 'erectores', name: 'Erectores' },
    { id: 'isquio', name: 'Isquios' },
    { id: 'gluteo', name: 'Glúteo' },
    { id: 'quads', name: 'Quads' },
    { id: 'gemelos', name: 'Gemelos' }
];

class VolumeDB {
    constructor() {
        this.db = null;
    }

    // Inicializar la BD
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'date' });
                    store.createIndex('date', 'date', { unique: true });
                }
            };
        });
    }

    // Obtener entry de un día (null si no existe)
    async getDay(dateStr) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(dateStr);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    // Guardar/actualizar día
    async saveDay(dateStr, sets) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const entry = { date: dateStr, sets };
            const request = store.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Obtener múltiples días (array de fechas)
    async getDays(dateStrArray) {
        const promises = dateStrArray.map(d => this.getDay(d));
        return Promise.all(promises);
    }

    // Exportar todos los datos
    async exportAll() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Importar datos (fusiona/sobrescribe por fecha)
    async importData(dataArray) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            dataArray.forEach(entry => {
                store.put(entry);
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // Limpiar día (poner todos los sets a 0, o eliminar la entrada)
    async clearDay(dateStr) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(dateStr);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Utilidades de fecha
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function addDays(dateStr, days) {
    const date = parseDate(dateStr);
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

function getLast7Days(endDateStr) {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        dates.push(addDays(endDateStr, -i));
    }
    return dates;
}

function getTodayStr() {
    return formatDate(new Date());
}
