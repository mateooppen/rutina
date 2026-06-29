# Rutina

Tracker de rutina de gimnasio en una sola página (HTML + CSS + JS vanilla, sin dependencias ni build). Se abre directo en el navegador.

## Estructura

- **`index.html`** — markup de la página.
- **`style.css`** — estilos (incluye dark mode automático según el sistema).
- **`script.js`** — datos de la rutina y toda la lógica.
- **`assets/`** — GIFs e imágenes de los ejercicios.

## Cómo usarlo

Abrí `index.html` en el navegador. El progreso semanal se guarda localmente en el navegador (`localStorage`), no requiere servidor ni conexión.

## Dónde tocar para modificar la rutina

Todo en `script.js`:

- `DAYS_DATA` — resumen de días para el tracker semanal.
- `routine` — detalle completo (ejercicios, series, reps, RIR, descansos, pasos de técnica, notas).
- `getPhase()` — progresión por fases/semanas.
- `EXERCISE_MEDIA` — mapa de cada ejercicio a su archivo en `assets/`.

Desde la consola del navegador, `auditMedia()` reporta la cobertura de imágenes y `validateData()` avisa si `DAYS_DATA` y `routine` quedaron desincronizados.
