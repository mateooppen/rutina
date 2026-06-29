
const STORAGE_KEY = 'rutina_pepa_v2';
const TOTAL_DAYS = 4;
const DAYS_DATA = [
  { id: 0, short: 'A', name: 'Cuádriceps + abductores', title: 'Piernas I', dur: '~43 min' },
  { id: 1, short: 'B', name: 'Pecho + espalda + hombros', title: 'Tren Superior I', dur: '~43 min' },
  { id: 2, short: 'C', name: 'Glúteos + isquios + aductores', title: 'Piernas II', dur: '~43 min' },
  { id: 3, short: 'D', name: 'Espalda + hombros + tríceps', title: 'Tren Superior II', dur: '~43 min' },
];

function getPhase(week) {
  if (week <= 2) return 'Adaptación · RIR 3';
  if (week <= 4) return 'Sobrecarga Progresiva · RIR 2';
  return 'Consolidación de Fuerza · RIR 2';
}

function emptyWeek() { return new Array(TOTAL_DAYS).fill(false); }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { currentWeek: 1, viewWeek: 1, weeks: {} };
}
function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function getWeekDays(s, w) {
  return s.weeks[w] || emptyWeek();
}

function countDone(days) { return days.filter(Boolean).length; }

function renderTracker() {
  const s = loadState();
  const vw = s.viewWeek || s.currentWeek;
  const days = getWeekDays(s, vw);
  const done = countDone(days);
  const isCurrent = vw === s.currentWeek;
  const pct = (done / TOTAL_DAYS) * 100;

  let html = `
    <div class="week-nav">
      <button onclick="navWeek(-1)" ${vw <= 1 ? 'disabled' : ''}>◀</button>
      <div class="week-label">Semana ${vw}</div>
      <button onclick="navWeek(1)" ${vw >= s.currentWeek ? 'disabled' : ''}>▶</button>
    </div>
    <div class="week-phase">${getPhase(vw)}</div>
    <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    <div class="progress-text">${done} de ${TOTAL_DAYS} días</div>
    <div class="days-grid">`;

  DAYS_DATA.forEach((d, i) => {
    const checked = days[i];
    const canToggle = isCurrent;
    html += `
      <div class="day-row ${checked ? 'done' : ''}" ${canToggle ? `onclick="toggleDay(${i})"` : ''}>
        <div class="day-check">${checked ? '✓' : ''}</div>
        <div class="day-info">
          <div class="day-name">${d.short} — ${d.title}</div>
          <div class="day-focus">${d.name}</div>
        </div>
        <div class="day-dur">${d.dur}</div>
      </div>`;
  });
  html += '</div>';
  document.getElementById('trackerCard').innerHTML = html;
  renderHistory();
}

function toggleDay(idx) {
  const s = loadState();
  const w = s.currentWeek;
  if (!s.weeks[w]) s.weeks[w] = emptyWeek();
  s.weeks[w][idx] = !s.weeks[w][idx];

  if (countDone(s.weeks[w]) === TOTAL_DAYS) {
    s.currentWeek++;
    s.viewWeek = s.currentWeek;
  } else {
    s.viewWeek = w;
  }
  saveState(s);
  renderTracker();
}

function navWeek(dir) {
  const s = loadState();
  const nw = (s.viewWeek || s.currentWeek) + dir;
  if (nw < 1 || nw > s.currentWeek) return;
  s.viewWeek = nw;
  saveState(s);
  renderTracker();
}

function renderHistory() {
  const s = loadState();
  const completed = [];
  for (let w = 1; w < s.currentWeek; w++) {
    const d = getWeekDays(s, w);
    completed.push({ week: w, done: countDone(d) });
  }
  const el = document.getElementById('historySection');
  if (completed.length === 0) { el.innerHTML = ''; return; }
  let html = `<div class="history-title">Semanas completadas</div><div class="history-chips">`;
  completed.forEach(c => {
    const cls = c.done === TOTAL_DAYS ? 'chip' : 'chip partial';
    html += `<span class="${cls}">S${c.week} · ${c.done}/${TOTAL_DAYS}</span>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

function showReset() { document.getElementById('overlay').classList.add('show'); }
function hideReset() { document.getElementById('overlay').classList.remove('show'); }
function doReset() {
  localStorage.removeItem(STORAGE_KEY);
  hideReset();
  renderTracker();
}

// === ROUTINE DATA WITH DETAILED TECH STEPS ===
const routine = [
  {
    title: 'Día A — Piernas I',
    focus: 'Cuádriceps, abductores y core. Énfasis en tonificación.',
    dur: '~43 min',
    warmup: {
      meta: '7 min',
      exercises: [
        { name: 'Cinta — ritmo moderado', sets: '5 min', note: 'Entrada en calor general.', steps: ['Caminá o trotá suave a un ritmo que eleve un poco las pulsaciones sin agitarte.', 'Usá estos minutos para soltar el cuerpo y entrar en foco.', 'Subí levemente la inclinación si querés activar más los glúteos.'], img: '' },
        { name: 'Sentadillas libres corporales', sets: '2 × 10', note: 'Foco en la profundidad y técnica.', steps: ['Pies al ancho de hombros, puntas levemente hacia afuera.', 'Iniciá el descenso empujando la cadera hacia atrás como si te sentaras.', 'Mantené el pecho erguido y las rodillas alineadas con la punta de los pies.', 'Bajá buscando romper el paralelo si la movilidad lo permite.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Cinta ya hecha en calentamiento',
      isTable: true,
      exercises: [
        { name: 'Sentadilla en máquina Smith', sets: '4 × 10', rir: 'RIR 2-3', rest: '60s', steps: ['Colocá la barra del Smith apoyada sobre la parte alta de la espalda (trapecio), no sobre el cuello.', 'Separá los pies un poco adelante de la línea de la barra para que la rodilla no se vaya tan al frente.', 'Bajá controlada hasta que los muslos queden paralelos al piso.', 'Empujá con toda la planta del pie para subir, sin bloquear de golpe las rodillas.'], img: '' },
        { name: 'Prensa de piernas', sets: '4 × 12', rir: 'RIR 2', rest: '60s', steps: ['Sentate con la espalda y la cadera bien apoyadas en el respaldo.', 'Colocá los pies en el centro de la plataforma al ancho de hombros.', 'Bajá la plataforma flexionando las rodillas hacia el pecho sin despegar la cola del asiento.', 'Empujá sin bloquear por completo las rodillas arriba.'], img: '' },
        { name: 'Extensión de cuádriceps', sets: '3 × 15', rir: 'RIR 1-2', rest: '45s', steps: ['Ajustá el respaldo para que la rodilla quede alineada con el eje de giro de la máquina.', 'Colocá el rodillo sobre la parte baja de la canilla, arriba del tobillo.', 'Estirá las piernas con control apretando el cuádriceps arriba 1 segundo.', 'Bajá lento, sin dejar que el peso caiga de golpe.'], img: '' },
        { name: 'Abducción de cadera (máquina)', sets: '3 × 15', rir: 'RIR 1', rest: '45s', steps: ['Sentate en la máquina con los almohadones apoyados en la parte externa de los muslos.', 'Empujá las rodillas hacia afuera venciendo la resistencia.', 'Apretá el glúteo medio al final del recorrido.', 'Controlá la fase de regreso, sin dejar que las piernas se cierren de golpe.'], img: '' },
        { name: 'Plancha frontal', sets: '3 × 30s', rir: '—', rest: '45s', steps: ['Apoyá los antebrazos en el piso alineados bajo los hombros.', 'Formá una línea recta de la cabeza a los talones, sin levantar la cola ni hundir la cadera.', 'Apretá abdomen y glúteos durante todo el tiempo.', 'Respirá normal, no aguantes el aire.'], img: '' }
      ]
    },
    cool: {
      meta: '5 min',
      exercises: [
        { name: 'Estiramiento de cuádriceps de pie', sets: '1 min/lado', note: 'Estático.', steps: ['Parada, llevá un talón hacia la cola tomándolo con la mano del mismo lado.', 'Mantené las rodillas juntas y la cadera levemente hacia adelante.', 'Sostené sin rebotar, apoyate en una pared si te falta equilibrio.'], img: '' },
        { name: 'Estiramiento de flexores de cadera (Psoas)', sets: '1 min/lado', note: 'Zancada estática.', steps: ['Colocate de rodillas, da un paso adelante con un pie en ángulo de 90 grados.', 'Empujá la pelvis levemente hacia adelante y abajo manteniendo el torso erguido.', 'Debés sentir el estiramiento en la zona frontal de la cadera de la pierna trasera.'], img: '' }
      ]
    },
    notes: ['Cuidá que las rodillas nunca colapsen hacia adentro en sentadilla y prensa: imaginá que las "empujás" hacia afuera durante todo el movimiento.']
  },
  {
    title: 'Día B — Tren Superior I',
    focus: 'Pecho, espalda, hombros y bíceps.',
    dur: '~43 min',
    warmup: {
      meta: '7 min',
      exercises: [
        { name: 'Cinta — ritmo moderado', sets: '5 min', note: 'Entrada en calor general.', steps: ['Caminá o trotá suave para elevar la temperatura corporal.', 'Movimientos de brazos relajados mientras caminás para soltar los hombros.'], img: '' },
        { name: 'Dislocaciones de hombro con banda', sets: '2 min', note: 'Con banda elástica o palo.', steps: ['Tomá una banda de los extremos con las manos bien separadas.', 'Pasá la banda por encima de la cabeza hacia la espalda con los brazos estirados, sin flexionar codos.', 'Volvé al frente controladamente. Cerrá un poco el agarre si te cuesta.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Cinta ya hecha en calentamiento',
      isTable: true,
      exercises: [
        { name: 'Press de pecho en máquina', sets: '4 × 10', rir: 'RIR 2-3', rest: '60s', steps: ['Ajustá el asiento para que las manijas queden a la altura media del pecho.', 'Apoyá bien la espalda y juntá levemente las escápulas.', 'Empujá hacia adelante sin bloquear de golpe los codos.', 'Volvé controlada sintiendo el estiramiento del pecho.'], img: '' },
        { name: 'Jalón al pecho en polea alta', sets: '4 × 10', rir: 'RIR 2', rest: '60s', steps: ['Tomá la barra un poco más ancho que los hombros, sentada y con los muslos fijados bajo el soporte.', 'Llevá la barra hacia la parte alta del pecho tirando con los codos hacia abajo y atrás.', 'Pensá en juntar las escápulas, no en tirar solo con los brazos.', 'Volvé arriba controlada estirando bien la espalda.'], img: '' },
        { name: 'Press de hombros con mancuernas', sets: '3 × 10', rir: 'RIR 2', rest: '60s', steps: ['Sentada con respaldo casi vertical, subí las mancuernas a la altura de las orejas, palmas al frente.', 'Empujá hacia arriba en línea recta sin chocar las mancuernas.', 'No bloquees los codos de golpe arriba.', 'Bajá controlada hasta la altura de las orejas.'], img: '' },
        { name: 'Dominadas asistidas (máquina)', sets: '3 × 8', rir: 'RIR 2', rest: '60s', steps: ['Apoyá las rodillas o los pies en la plataforma de asistencia.', 'Tomá la barra un poco más ancho que los hombros.', 'Tirá llevando el pecho hacia la barra, guiando con los codos hacia abajo.', 'Bajá controlada hasta estirar casi por completo los brazos.'], img: '' },
        { name: 'Curl de bíceps alternado', sets: '3 × 12', rir: 'RIR 1-2', rest: '45s', steps: ['Parada o sentada, mancuernas a los lados con las palmas hacia el cuerpo.', 'Flexioná un codo subiendo la mancuerna y rotando la palma hacia arriba.', 'Bajá controlada y alterná con el otro brazo.', 'Mantené los codos fijos pegados al cuerpo.'], img: '' }
      ]
    },
    cool: {
      meta: '5 min',
      exercises: [
        { name: 'Estiramiento de pectoral', sets: '1 min/lado', note: 'En marco de puerta.', steps: ['Apoyá el antebrazo en un marco de puerta a 90 grados.', 'Da un pequeño paso adelante rotando levemente el torso hacia el lado contrario.', 'Sentí el estiramiento en la zona del pecho.'], img: '' },
        { name: 'Estiramiento de dorsales', sets: '1 min', note: 'Manos en pared.', steps: ['Colocá las manos en la pared a la altura de los hombros y da un paso atrás.', 'Dejá caer el pecho hacia el piso estirando toda la espalda alta.', 'Respirá lento.'], img: '' }
      ]
    },
    notes: ['En las dominadas asistidas, bajá el peso de asistencia de a poco con las semanas: menos asistencia = más esfuerzo propio. Es la forma de progresar hacia la dominada libre.']
  },
  {
    title: 'Día C — Piernas II',
    focus: 'Glúteos, isquiotibiales y aductores. Énfasis en cadena posterior.',
    dur: '~43 min',
    warmup: {
      meta: '7 min',
      exercises: [
        { name: 'Cinta — ritmo moderado', sets: '5 min', note: 'Entrada en calor general.', steps: ['Caminá o trotá suave para elevar las pulsaciones.', 'Si usás cinta con inclinación, subila un poco para pre-activar glúteos.'], img: '' },
        { name: 'Puentes de glúteo', sets: '2 × 15', note: 'Sin peso, activación.', steps: ['Acostate boca arriba con rodillas flexionadas y pies apoyados.', 'Empujá con los talones para elevar la cadera.', 'Apretá fuerte los glúteos arriba formando una línea recta de rodillas a hombros.', 'Bajá controlada.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Cinta ya hecha en calentamiento',
      isTable: true,
      exercises: [
        { name: 'Hip Thrust con barra', sets: '4 × 12', rir: 'RIR 2', rest: '60s', steps: ['Apoyá la parte media de la espalda (escápulas) contra un banco estable.', 'Colocá la barra sobre la pelvis (usá una colchoneta o pad para no lastimarte).', 'Con los pies firmes, empujá la cadera hacia el techo apretando los glúteos.', 'Sostené 1 segundo arriba con el mentón cerca del pecho y la mirada al frente.'], img: '' },
        { name: 'Romanian Deadlift con mancuernas', sets: '4 × 10', rir: 'RIR 2', rest: '60s', steps: ['Parada con mancuernas al frente de los muslos, rodillas levemente flexionadas.', 'Llevá la cadera hacia atrás bajando las mancuernas pegadas a las piernas.', 'Mantené la espalda recta; vas a sentir el estiramiento atrás del muslo.', 'Subí empujando la cadera hacia adelante apretando los glúteos.'], img: '' },
        { name: 'Curl de isquiotibiales (máquina)', sets: '3 × 12', rir: 'RIR 1-2', rest: '45s', steps: ['Acomodate en la máquina (tumbada o sentada según el modelo) con el rodillo sobre la parte baja de la pantorrilla.', 'Flexioná las rodillas llevando el talón hacia la cola.', 'Apretá el isquiotibial al final del recorrido.', 'Bajá lento controlando el peso.'], img: '' },
        { name: 'Aducción de cadera (máquina)', sets: '3 × 15', rir: 'RIR 1', rest: '45s', steps: ['Sentate en la máquina con los almohadones en la parte interna de los muslos.', 'Cerrá las piernas juntando las rodillas venciendo la resistencia.', 'Apretá la zona interna del muslo al final.', 'Volvé controlada sin dejar que se abran de golpe.'], img: '' },
        { name: 'Patada de glúteo en polea baja', sets: '3 × 15/lado', rir: 'RIR 1', rest: '45s', steps: ['Colocá la tobillera de la polea baja en un tobillo.', 'Inclinada levemente al frente tomándote del soporte, llevá la pierna hacia atrás.', 'El movimiento nace del glúteo, no de la espalda baja: no arquees la lumbar.', 'Volvé controlada al frente.'], img: '' }
      ]
    },
    cool: {
      meta: '6 min',
      exercises: [
        { name: 'Estiramiento de isquiotibiales en el suelo', sets: '1 min/pierna', note: 'Sentada.', steps: ['Sentate con una pierna estirada al frente y la otra flexionada hacia adentro.', 'Llevá las manos hacia el tobillo o la punta del pie sin flexionar la rodilla.', 'Mantené la posición sintiendo la relajación muscular.'], img: '' },
        { name: 'Estiramiento de glúteo/piramidal', sets: '1 min/lado', note: 'Postura de la paloma o acostada.', steps: ['Acostada boca arriba, cruzá un tobillo sobre la rodilla contraria formando un "4".', 'Tomá la pierna de atrás y traela hacia el pecho.', 'Sentí el estiramiento en el glúteo de la pierna cruzada.'], img: '' }
      ]
    },
    notes: ['En el hip thrust y el RDL la clave es que el movimiento lo haga la cadera y los glúteos, nunca la zona lumbar. Si sentís la espalda baja, bajá el peso y revisá la técnica.']
  },
  {
    title: 'Día D — Tren Superior II',
    focus: 'Espalda, hombros, tríceps y core.',
    dur: '~43 min',
    warmup: {
      meta: '7 min',
      exercises: [
        { name: 'Cinta — ritmo moderado', sets: '5 min', note: 'Entrada en calor general.', steps: ['Caminá o trotá suave para entrar en calor.', 'Soltá los hombros con movimientos relajados de brazos.'], img: '' },
        { name: 'Bird-Dog', sets: '2 × 8/lado', note: 'Activa core y cadena cruzada.', steps: ['En cuadrupedia, extendé el brazo derecho adelante y la pierna izquierda atrás a la vez.', 'Formá una línea recta de la mano al pie sin arquear la espalda baja.', 'Regresá al centro con control e intercambiá.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Cinta ya hecha en calentamiento',
      isTable: true,
      exercises: [
        { name: 'Remo en máquina sentada', sets: '4 × 10', rir: 'RIR 2-3', rest: '60s', steps: ['Sentate con el pecho apoyado en el soporte (si la máquina lo tiene) y los pies firmes.', 'Tomá las manijas y traccioná llevando los codos hacia atrás.', 'Pensá en juntar las escápulas, no en tirar solo con los brazos.', 'Volvé controlada estirando bien la espalda al frente.'], img: '' },
        { name: 'Dominadas asistidas (máquina)', sets: '4 × 8', rir: 'RIR 2', rest: '60s', steps: ['Apoyá las rodillas o los pies en la plataforma de asistencia.', 'Tomá la barra un poco más ancho que los hombros.', 'Tirá llevando el pecho hacia la barra, guiando con los codos hacia abajo.', 'Bajá controlada hasta estirar casi por completo los brazos.'], img: '' },
        { name: 'Face Pull en polea', sets: '3 × 15', rir: 'RIR 1-2', rest: '45s', steps: ['Colocá la polea a la altura de la cara con la cuerda.', 'Tomá los extremos de la cuerda y da un paso atrás.', 'Tirá hacia tu frente/nariz abriendo los codos y separando las manos al final.', 'Sentí cómo se juntan las escápulas atrás.'], img: '' },
        { name: 'Extensión de tríceps en polea alta', sets: '3 × 12', rir: 'RIR 1-2', rest: '45s', steps: ['Tomá la barra o cuerda de la polea alta con los codos pegados al cuerpo.', 'Estirá los brazos hacia abajo manteniendo los codos fijos en su lugar.', 'Apretá el tríceps abajo 1 segundo.', 'Subí controlada hasta que el antebrazo quede paralelo al piso.'], img: '' },
        { name: 'Dead Bug', sets: '3 × 10/lado', rir: '—', rest: '45s', steps: ['Acostate boca arriba con brazos al techo y rodillas a 90 grados.', 'Aplaná firme la espalda baja contra el piso.', 'Extendé un brazo hacia atrás y la pierna contraria al frente a la vez.', 'Volvé al centro lento y cambiá de lado sin despegar la lumbar.'], img: '' }
      ]
    },
    cool: {
      meta: '5 min',
      exercises: [
        { name: 'Estiramiento de tríceps', sets: '1 min/lado', note: 'Brazo arriba.', steps: ['Llevá un brazo arriba y flexioná el codo dejando caer la mano detrás de la nuca.', 'Con la otra mano empujá suave el codo hacia adentro.', 'Sostené sin rebotar.'], img: '' },
        { name: 'Estiramiento de espalda alta', sets: '1 min', note: 'Manos entrelazadas al frente.', steps: ['Entrelazá las manos al frente y empujalas hacia adelante redondeando la espalda alta.', 'Bajá el mentón hacia el pecho separando las escápulas.', 'Respirá lento sintiendo el estiramiento entre los omóplatos.'], img: '' }
      ]
    },
    notes: ['Face Pull: clave para una buena postura de hombros. Llevá la cuerda hacia la frente separando las manos al final del movimiento, sin encoger los hombros hacia las orejas.']
  }
];

// === MAPA CENTRAL DE IMÁGENES ===
// Fuente única de verdad. Las claves coinciden EXACTAMENTE con el nombre del ejercicio en `routine`.
// Un GIF animado por ejercicio (se anima solo). '' = sin imagen disponible.
// Los archivos van en la carpeta MEDIA_PATH ('assets/').
const MEDIA_PATH = 'assets/';
const EXERCISE_MEDIA = {
  // --- Calentamiento ---
  'Sentadillas libres corporales':              'bodyweight_squat.png',
  'Dislocaciones de hombro con banda':          'band_shoulder.png',
  'Puentes de glúteo':                          'glute_bridge.gif',
  'Bird-Dog':                                   'bird_dog.png',
  // --- Día A ---
  'Sentadilla en máquina Smith':                'smith_squat.gif',
  'Prensa de piernas':                          'leg_press.gif',
  'Extensión de cuádriceps':                    'leg_extension.gif',
  'Abducción de cadera (máquina)':              'hip_abduction.gif',
  'Plancha frontal':                            'plank.gif',
  // --- Día B ---
  'Press de pecho en máquina':                  'chest_press.gif',
  'Jalón al pecho en polea alta':               'lat_pulldown.gif',
  'Press de hombros con mancuernas':            'shoulder_press.gif',
  'Dominadas asistidas (máquina)':              'assisted_pullup.gif',
  'Curl de bíceps alternado':                   'biceps_curl.gif',
  // --- Día C ---
  'Hip Thrust con barra':                       'hip_thrust.png',
  'Romanian Deadlift con mancuernas':           'rdl.gif',
  'Curl de isquiotibiales (máquina)':           'leg_curl.gif',
  'Aducción de cadera (máquina)':               'hip_adduction.gif',
  'Patada de glúteo en polea baja':             'glute_kickback.gif',
  // --- Día D ---
  'Remo en máquina sentada':                    'seated_row.gif',
  'Face Pull en polea':                         'face_pull.gif',
  'Extensión de tríceps en polea alta':         'triceps_pushdown.gif',
  'Dead Bug':                                   'dead_bug.gif',
  // --- Estiramientos ---
  'Estiramiento de cuádriceps de pie':          'stretch_quad.png',
  'Estiramiento de flexores de cadera (Psoas)': 'stretch_hipflexor.jpg',
  'Estiramiento de pectoral':                   'stretch_pec.png',
  'Estiramiento de dorsales':                   'stretch_lat.gif',
  'Estiramiento de isquiotibiales en el suelo': 'stretch_hamstring.gif',
  'Estiramiento de glúteo/piramidal':           'stretch_glute.gif',
  'Estiramiento de tríceps':                    'stretch_triceps.gif',
  'Estiramiento de espalda alta':               'stretch_upperback.gif',
  // --- Opcional / sin match en el banco ---
  'Cinta — ritmo moderado':                     '',
};

// Ejercicios sin GIF a propósito (no hay equivalente claro en el banco): no cuentan como pendientes.
const MEDIA_SIN_MATCH = [
  'Cinta — ritmo moderado',
];

// Busca el archivo de un ejercicio tolerando diferencias de mayúsculas, espacios
// sobrantes y normalización de acentos (NFC/NFD). Prioriza el match exacto para
// no alterar el comportamiento previo; solo si no existe intenta el match normalizado.
function getMedia(name) {
  if (Object.prototype.hasOwnProperty.call(EXERCISE_MEDIA, name)) return EXERCISE_MEDIA[name];
  const norm = s => String(s).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
  const target = norm(name);
  for (const key of Object.keys(EXERCISE_MEDIA)) {
    if (norm(key) === target) return EXERCISE_MEDIA[key];
  }
  return '';
}

function mediaHTML(name) {
  const gif = getMedia(name);
  if (!gif) return ''; // sin imagen: solo se muestran los pasos de técnica
  return `
            <div class="ex-media-box has-media">
              <img src="${MEDIA_PATH}${gif}" alt="${name}" loading="lazy">
            </div>`;
}

function mediaStats() {
  const names = Object.keys(EXERCISE_MEDIA).filter(n => !MEDIA_SIN_MATCH.includes(n));
  const pending = names.filter(n => !EXERCISE_MEDIA[n]);
  return { total: names.length, done: names.length - pending.length, pending };
}

// Auditoría desde consola (solo para desarrollo, no se muestra en la app).
function auditMedia() {
  const s = mediaStats();
  console.log(`Cobertura de imágenes: ${s.done}/${s.total}`);
  if (s.pending.length) console.log('Pendientes:\n- ' + s.pending.join('\n- '));
  else console.log('✅ Sin pendientes.');
  return s.pending;
}

function renderRoutine() {
  let html = `
    <div class="section-toggle" onclick="toggleSection('routineContent', this)">
      <span class="st-title">📋 Rutina Completa</span>
      <span class="arrow">▼</span>
    </div>
    <div class="section-content" id="routineContent">`;

  routine.forEach((day, idx) => {
    html += `
      <div class="day-card" id="dayCard${idx}">
        <div class="day-card-header" onclick="toggleDayCard(${idx})">
          <div class="dch-left">
            <div class="dch-title">${day.title}</div>
            <div class="dch-sub">${day.focus} · ${day.dur}</div>
          </div>
          <span class="dch-arrow">▼</span>
        </div>
        <div class="day-card-body">`;

    // warmup
    html += `
          <div class="block block-warmup">
            <div class="block-label">🔥 Entrada en Calor</div>
            <div class="block-meta">${day.warmup.meta}</div>
            <ul class="ex-list">`;
    day.warmup.exercises.forEach((e, eIdx) => { 
      html += `
        <li class="ex-item-wrap" id="w-wrap-${idx}-${eIdx}">
          <div class="ex-header-click" onclick="toggleExDetail(${idx}, 'warmup', ${eIdx})">
            <span class="ex-name">${e.name}</span>
            <span class="ex-detail">${e.sets} · <span style="color:var(--text-light)">${e.note}</span></span>
          </div>
          <div class="ex-tech-drawer" id="w-tech-${idx}-${eIdx}">
            <h5>💡 Ejecución Técnica</h5>
            <ol class="ex-tech-steps">${e.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            ${mediaHTML(e.name)}
          </div>
        </li>`; 
    });
    html += '</ul></div>';

    // main
    html += `
          <div class="block block-main">
            <div class="block-label">💪 Bloque Principal</div>
            <div class="block-meta">${day.main.meta}</div>`;

    if (day.main.isTable) {
      html += `<table class="ex-table"><thead><tr>
        <th>Ejercicio</th><th>Series × Reps</th><th>RIR</th><th>Desc.</th>
      </tr></thead><tbody>`;
      day.main.exercises.forEach((e, eIdx) => {
        html += `
        <tr class="clickable-row" id="m-row-${idx}-${eIdx}" onclick="toggleExDetail(${idx}, 'mainTable', ${eIdx})">
          <td class="td-name">${e.name}</td>
          <td>${e.sets}</td>
          <td><span class="tag tag-rir">${e.rir}</span></td>
          <td><span class="tag tag-rest">${e.rest}</span></td>
        </tr>
        <tr id="m-drawer-row-${idx}-${eIdx}" style="display:none;"><td colspan="4">
          <div class="ex-tech-drawer" style="display:block; margin: 0; border-left-color: var(--blue);">
            <h5>💡 Ejecución Técnica</h5>
            <ol class="ex-tech-steps">${e.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            ${mediaHTML(e.name)}
          </div>
        </td></tr>`;
      });
      html += '</tbody></table>';
    } else {
      html += '<ul class="ex-list">';
      day.main.exercises.forEach((e, eIdx) => {
        html += `
        <li class="ex-item-wrap" id="m-wrap-${idx}-${eIdx}">
          <div class="ex-header-click" onclick="toggleExDetail(${idx}, 'mainList', ${eIdx})">
            <span class="ex-name">${e.name}</span>
            <span class="ex-detail">${e.sets} · <span style="color:var(--text-light)">${e.note}</span></span>
          </div>
          <div class="ex-tech-drawer" id="m-tech-${idx}-${eIdx}" style="border-left-color: var(--blue);">
            <h5>💡 Ejecución Técnica</h5>
            <ol class="ex-tech-steps">${e.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            ${mediaHTML(e.name)}
          </div>
        </li>`;
      });
      html += '</ul>';
    }
    html += '</div>';

    // cool
    html += `
          <div class="block block-cool">
            <div class="block-label">🧊 Vuelta a la Calma</div>
            <div class="block-meta">${day.cool.meta}</div>
            <ul class="ex-list">`;
    day.cool.exercises.forEach((e, eIdx) => { 
      html += `
        <li class="ex-item-wrap" id="c-wrap-${idx}-${eIdx}">
          <div class="ex-header-click" onclick="toggleExDetail(${idx}, 'cool', ${eIdx})">
            <span class="ex-name">${e.name}</span>
            <span class="ex-detail">${e.sets} · <span style="color:var(--text-light)">${e.note}</span></span>
          </div>
          <div class="ex-tech-drawer" id="c-tech-${idx}-${eIdx}" style="border-left-color: var(--green);">
            <h5>💡 Ejecución Técnica</h5>
            <ol class="ex-tech-steps">${e.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            ${mediaHTML(e.name)}
          </div>
        </li>`; 
    });
    html += '</ul></div>';

    // notes
    day.notes.forEach(n => {
      html += `<div class="note-box"><span class="note-icon">💡</span> ${n}</div>`;
    });

    html += '</div></div>';
  });

  html += '</div>';
  document.getElementById('routineSection').innerHTML = html;
}

function toggleExDetail(dayIdx, blockType, exIdx) {
  if (blockType === 'warmup') {
    const wrap = document.getElementById(`w-wrap-${dayIdx}-${exIdx}`);
    const drawer = document.getElementById(`w-tech-${dayIdx}-${exIdx}`);
    const isActive = wrap.classList.toggle('active');
    drawer.style.display = isActive ? 'block' : 'none';
  } else if (blockType === 'cool') {
    const wrap = document.getElementById(`c-wrap-${dayIdx}-${exIdx}`);
    const drawer = document.getElementById(`c-tech-${dayIdx}-${exIdx}`);
    const isActive = wrap.classList.toggle('active');
    drawer.style.display = isActive ? 'block' : 'none';
  } else if (blockType === 'mainList') {
    const wrap = document.getElementById(`m-wrap-${dayIdx}-${exIdx}`);
    const drawer = document.getElementById(`m-tech-${dayIdx}-${exIdx}`);
    const isActive = wrap.classList.toggle('active');
    drawer.style.display = isActive ? 'block' : 'none';
  } else if (blockType === 'mainTable') {
    const row = document.getElementById(`m-row-${dayIdx}-${exIdx}`);
    const drawerRow = document.getElementById(`m-drawer-row-${dayIdx}-${exIdx}`);
    const isActive = row.classList.toggle('active');
    drawerRow.style.display = isActive ? 'table-row' : 'none';
  }
}

function renderGlossary() {
  document.getElementById('glossarySection').innerHTML = `
    <div class="section-toggle" onclick="toggleSection('glossaryContent', this)">
      <span class="st-title">📖 Glosario de Términos</span>
      <span class="arrow">▼</span>
    </div>
    <div class="section-content" id="glossaryContent" style="padding:0 4px;">
      <div class="glossary-item">
        <h4>RIR — Repeticiones en Reserva</h4>
        <p>Cuántas repeticiones más podrías haber hecho antes de que se caiga el peso. RIR 3 = te quedan 3 reps en el tanque.</p>
      </div>
      <div class="glossary-item">
        <h4>RPE — Rate of Perceived Exertion</h4>
        <p>Escala de 1 a 10 que mide el esfuerzo percibido. RPE 7 = esfuerzo moderado-alto, RPE 10 = fallo total.</p>
      </div>
      <div class="glossary-item">
        <h4>Tabla RIR ↔ RPE</h4>
        <table class="glossary-table">
          <thead><tr><th>RIR</th><th>RPE</th><th>Significado</th></tr></thead>
          <tbody>
            <tr><td>4+</td><td>6</td><td>Carga liviana, entrada en calor</td></tr>
            <tr><td>3</td><td>7</td><td>Esfuerzo moderado, técnica perfecta</td></tr>
            <tr><td>2</td><td>8</td><td>Desafiante pero controlado</td></tr>
            <tr><td>1</td><td>9</td><td>Muy cerca del límite</td></tr>
            <tr><td>0</td><td>10</td><td>Fallo muscular (no usar en esta rutina)</td></tr>
          </tbody>
        </table>
      </div>
      <div class="glossary-item">
        <h4>Fallo Muscular</h4>
        <p>Punto donde no podés completar una repetición más con buena técnica. En esta rutina <strong>nunca</strong> se llega al fallo: con poca experiencia es más importante consolidar la técnica y recuperar bien entre sesiones que exprimir cada serie.</p>
      </div>
      <div class="glossary-item" style="margin-top:16px">
        <h4>Progresión por Fases</h4>
        <div class="phase-card phase-1">
          <h4>Semanas 1-2 · Adaptación</h4>
          <p>RIR 3 (RPE 7). Pesos moderados, foco en la técnica perfecta y en conocer las máquinas.</p>
        </div>
        <div class="phase-card phase-2">
          <h4>Semanas 3-4 · Sobrecarga Progresiva</h4>
          <p>RIR 2 (RPE 8). Subir peso solo si la técnica de las semanas previas fue impecable.</p>
        </div>
        <div class="phase-card phase-3">
          <h4>Semanas 5+ · Consolidación de Fuerza</h4>
          <p>RIR 2. Sumar una rep extra o un poco de peso manteniendo siempre el control del movimiento.</p>
        </div>
      </div>
    </div>`;
}

function toggleSection(id, btn) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  btn.classList.toggle('open');
}

function toggleDayCard(idx) {
  document.getElementById('dayCard' + idx).classList.toggle('open');
}

// Validación de consistencia (solo desarrollo): avisa por consola si los datos
// resumidos (DAYS_DATA) y los detallados (routine) se desincronizan, o si a algún
// día le falta un bloque. No bloquea nada, solo emite console.warn.
function validateData() {
  if (DAYS_DATA.length !== routine.length) {
    console.warn(`⚠️ Inconsistencia: DAYS_DATA tiene ${DAYS_DATA.length} días y routine tiene ${routine.length}.`);
  }
  routine.forEach((day, i) => {
    ['warmup', 'main', 'cool'].forEach(block => {
      if (!day[block]) {
        console.warn(`⚠️ El día ${i} ("${day.title || '?'}") no tiene el bloque "${block}".`);
      }
    });
  });
}

// Init
validateData();
renderTracker();
renderRoutine();
renderGlossary();
