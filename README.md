# Volume Tracker 💪

PWA simple para tracking de volumen muscular con ventana móvil de 7 días.

## Características

- 📊 **Resumen de 7 días**: Visualiza el total de series por músculo en los últimos 7 días
- ✏️ **Editor rápido**: Añade o modifica series por día con steppers intuitivos
- 💾 **Local-first**: Todos los datos se guardan localmente en IndexedDB (sin servidor)
- 📱 **PWA completa**: Instálala en tu móvil y funciona offline
- 📤 **Exportar/Importar**: Respalda tus datos en formato JSON
- 🎨 **Dark mode**: Diseño oscuro por defecto, optimizado para móvil

## Músculos trackéados (14)

- Antebrazo, Bíceps, Tríceps
- Hombro Lateral, Hombro Delantero, Pecho
- Abs, Dorsal, Trapecio, Erectores
- Isquios, Glúteo, Quads, Gemelos

## Instalación local

### Opción 1: Servidor local simple

```bash
# Usando Python 3
python3 -m http.server 8000

# O usando Node.js (npx)
npx serve .

# O usando PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

### Opción 2: GitHub Pages (recomendado)

1. **Crear repositorio en GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Volume Tracker PWA"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/volumetracker.git
   git push -u origin main
   ```

2. **Activar GitHub Pages**:
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

3. **Acceder a tu app**:
   - Tu PWA estará en: `https://TU-USUARIO.github.io/volumetracker/`
   - Espera 1-2 minutos para el primer deploy

4. **Instalar en móvil**:
   - Abre la URL en Safari (iOS) o Chrome (Android)
   - iOS: Compartir → "Añadir a pantalla de inicio"
   - Android: Menú → "Instalar app" o "Añadir a pantalla de inicio"

## Uso

### Vista principal (Resumen 7 días)
- Muestra el total de series por músculo en los últimos 7 días
- Botón **"Editar hoy"** para abrir el editor del día actual
- Botón **⚙️** para ajustes (exportar/importar)

### Editor de día
- Navega entre fechas con las flechas o el selector de fecha
- Usa los botones **+/−** para ajustar series por músculo
- **Copiar ayer** (📋): Copia los valores del día anterior
- **Vaciar** (🗑️): Pone todos los valores a 0

### Exportar/Importar datos
- **Exportar**: Descarga un JSON con todos tus datos
- **Importar**: Selecciona un JSON para restaurar o fusionar datos

## Estructura del proyecto

```
volumetracker/
├── index.html          # UI principal (3 vistas: resumen, editor, ajustes)
├── app.js              # Lógica de la app
├── db.js               # Capa de IndexedDB
├── styles.css          # Estilos mobile-first
├── sw.js               # Service Worker (offline)
├── manifest.json       # Manifest PWA
├── icon.svg            # Icono de la app
└── README.md           # Este archivo
```

## Tecnologías

- **Vanilla JavaScript** (sin frameworks)
- **IndexedDB** para persistencia local
- **Service Worker** para funcionalidad offline
- **CSS moderno** con variables y grid/flexbox
- **PWA Manifest** para instalación nativa

## Formato de datos (JSON)

```json
[
  {
    "date": "2025-11-03",
    "sets": {
      "pecho": 12,
      "triceps": 8,
      "hombro_delantero": 6
    }
  }
]
```

Los músculos no incluidos equivalen a 0 series.

## Ventana móvil de 7 días

La app siempre calcula el total de los **últimos 7 días** (hoy - 6 días hasta hoy).
- Si un día no tiene datos, se considera 0.
- Los cálculos se actualizan en tiempo real al cambiar valores.

## Troubleshooting

### La PWA no se instala
- Asegúrate de estar usando **HTTPS** (GitHub Pages lo hace automáticamente)
- Verifica que el Service Worker esté registrado en DevTools → Application → Service Workers

### Los datos no se guardan
- Verifica que IndexedDB esté habilitado en tu navegador
- En DevTools → Application → Storage, busca `VolumeTrackerDB`

### Actualizaciones no se aplican
- En modo desarrollo, fuerza refresh: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
- En producción, el Service Worker mostrará un aviso "Nueva versión disponible"

## Próximas mejoras (opcionales)

- [ ] Gráficos/sparklines de evolución por músculo
- [ ] Comparativa con semana anterior (Δ)
- [ ] Objetivos personalizados por músculo
- [ ] Calendario mensual con heatmap
- [ ] PWA Shortcuts para atajos rápidos
- [ ] Recordatorios con Web Push

---

**¡Disfruta del tracking! 🚀**
