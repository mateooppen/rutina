
const STORAGE_KEY = 'rutina_vero_v1';

// DAYS_DATA y TOTAL_DAYS se derivan de `routine` (fuente única de verdad) más
// abajo, una vez definida la rutina, para que el resumen del tracker y el
// detalle no puedan desincronizarse.

function getPhase(week) {
  if (week <= 2) return 'Adaptación · RIR 3-4';
  if (week <= 4) return 'Progresión · RIR 2-3';
  return 'Consolidación · RIR 2';
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
    short: 'A',
    dayLabel: 'Full body',
    focus: 'Cuerpo completo · cuádriceps, pecho y espalda',
    summary: 'Cuádriceps, pecho y espalda',
    dur: '~40 min',
    warmup: {
      meta: '~7 min',
      exercises: [
        { name: 'Bici fija — ritmo suave', sets: '5 min', note: 'Entrada en calor, amable con la rodilla.', steps: ['Pedaleá a un ritmo cómodo que eleve un poco las pulsaciones sin agitarte.', 'Ajustá el asiento para que la rodilla quede apenas flexionada abajo, sin estirarse del todo.', 'Usá estos minutos para entrar en calor y soltar las piernas.'], img: '' },
        { name: 'Sentadillas libres corporales', sets: '2 × 10', note: 'Activación, rango cómodo.', steps: ['Pies al ancho de hombros, puntas levemente hacia afuera.', 'Bajá llevando la cadera atrás solo hasta donde te resulte cómodo, sin buscar profundidad.', 'Mantené las rodillas alineadas con las puntas de los pies, sin dejarlas caer hacia adentro.', 'Subí empujando con toda la planta, sin bloquear de golpe.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Bici ya hecha en el calentamiento',
      isTable: true,
      exercises: [
        { name: 'Prensa de piernas', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Sentadilla goblet a banco', steps: ['Sostené una mancuerna contra el pecho con las dos manos.', 'Bajá llevando la cadera atrás hasta apoyar apenas la cola en un banco, en rango cómodo.', 'Mantené el pecho erguido y las rodillas alineadas con los pies, sin que caigan hacia adentro.', 'Subí empujando con los talones, sin bloquear de golpe.'] }, tip: 'Que las rodillas no caigan hacia adentro: imaginá que las empujás levemente hacia afuera, y quedate siempre en un rango que no te moleste la rodilla.', steps: ['Sentate con la espalda y la cadera bien apoyadas en el respaldo.', 'Pies en el centro de la plataforma al ancho de hombros.', 'Bajá la plataforma con control solo hasta un rango cómodo, sin que la rodilla moleste.', 'Empujá sin bloquear las rodillas arriba y sin dejarlas caer hacia adentro.'], img: '' },
        { name: 'Curl femoral en máquina', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Puente de glúteo con peso', steps: ['Acostate boca arriba con rodillas flexionadas y pies apoyados; apoyá una pesa sobre la cadera.', 'Empujá con los talones subiendo la cadera y apretando los glúteos.', 'Formá una línea recta de rodillas a hombros, sin arquear la lumbar.', 'Bajá controlada.'] }, steps: ['Acomodate con el rodillo sobre la parte baja de la pantorrilla, arriba del talón.', 'Flexioná las rodillas llevando el talón hacia la cola.', 'Apretá el isquiotibial al final del recorrido.', 'Bajá lento, controlando el peso.'], img: '' },
        { name: 'Press de pecho en máquina', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Press de pecho con mancuernas', steps: ['Acostada en un banco, mancuernas a la altura del pecho con las palmas hacia los pies.', 'Empujá hacia arriba juntando levemente las mancuernas, sin bloquear de golpe los codos.', 'Bajá controlada hasta sentir el estiramiento del pecho.', 'Mantené las muñecas firmes y los hombros apoyados en el banco.'] }, steps: ['Ajustá el asiento para que las manijas queden a la altura media del pecho.', 'Apoyá bien la espalda en el respaldo y juntá levemente las escápulas.', 'Empujá al frente sin bloquear de golpe los codos.', 'Volvé controlada sintiendo el estiramiento del pecho.'], img: '' },
        { name: 'Jalón al pecho en polea', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Remo con mancuerna', steps: ['Apoyá una mano y la rodilla del mismo lado en un banco, con la espalda recta y casi paralela al piso.', 'Con la otra mano sostené la mancuerna con el brazo estirado.', 'Traccioná llevando el codo hacia atrás pegado al cuerpo, juntando la escápula.', 'Bajá controlada estirando el brazo.'] }, steps: ['Sentate con los muslos fijados bajo el soporte y tomá la barra un poco más ancho que los hombros.', 'Llevá la barra a la parte alta del pecho tirando con los codos hacia abajo y atrás.', 'Pensá en juntar las escápulas, sin encoger los hombros hacia las orejas.', 'Volvé arriba controlada estirando bien la espalda.'], img: '' },
        { name: 'Press de hombros en máquina', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Elevaciones laterales', steps: ['Parada o sentada, una mancuerna liviana en cada mano a los costados.', 'Subí los brazos hacia los lados hasta la altura de los hombros, con los codos apenas flexionados.', 'No encojas los hombros hacia las orejas ni uses impulso.', 'Bajá lento controlando el peso.'] }, steps: ['Sentate con la espalda firme contra el respaldo, sin apoyar carga sobre el cuello.', 'Tomá las manijas a la altura de los hombros.', 'Empujá hacia arriba sin bloquear de golpe los codos.', 'Bajá controlada hasta la altura de los hombros, sin encoger los hombros hacia las orejas.'], img: '' },
        { name: 'Plancha frontal', sets: '3 × 20-30s', rir: '—', rest: '45s', alt: '', steps: ['Apoyá los antebrazos bajo los hombros.', 'Formá una línea recta de la cabeza a los talones, sin levantar la cola ni hundir la cadera.', 'Apretá abdomen y glúteos, con el cuello largo y la mirada al piso.', 'Respirá normal, no aguantes el aire.'], img: '' }
      ]
    },
    cool: {
      meta: '~5 min',
      exercises: [
        { name: 'Estiramiento de cuádriceps de pie', sets: '1 min/lado', note: 'Suave, sin rebotar.', steps: ['Parada, llevá un talón hacia la cola tomándolo con la mano del mismo lado.', 'Mantené las rodillas juntas y la cadera levemente hacia adelante.', 'Apoyate en una pared si te falta equilibrio, sin rebotar.'], img: '' },
        { name: 'Estiramiento de pectoral', sets: '1 min/lado', note: 'En marco de puerta.', steps: ['Apoyá el antebrazo en el marco de una puerta a 90 grados.', 'Da un pequeño paso adelante rotando suave el torso hacia el lado contrario.', 'Sentí el estiramiento en el pecho, sin forzar el hombro.'], img: '' }
      ]
    }
  },
  {
    short: 'B',
    dayLabel: 'Full body',
    focus: 'Cuerpo completo · glúteos, espalda y hombros',
    summary: 'Glúteos, espalda y hombros',
    dur: '~40 min',
    warmup: {
      meta: '~7 min',
      exercises: [
        { name: 'Bici fija — ritmo suave', sets: '5 min', note: 'Entrada en calor, amable con la rodilla.', steps: ['Pedaleá a un ritmo cómodo que eleve un poco las pulsaciones sin agitarte.', 'Ajustá el asiento para que la rodilla quede apenas flexionada abajo, sin estirarse del todo.', 'Usá estos minutos para entrar en calor y soltar las piernas.'], img: '' },
        { name: 'Puentes de glúteo', sets: '2 × 15', note: 'Activación de glúteos.', steps: ['Acostate boca arriba, rodillas flexionadas y pies apoyados al ancho de cadera.', 'Empujá con los talones para subir la cadera apretando los glúteos.', 'Formá una línea recta de rodillas a hombros, sin arquear la zona lumbar.', 'Bajá controlada.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Bici ya hecha en el calentamiento',
      isTable: true,
      exercises: [
        { name: 'Hip thrust', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Puente de glúteo con peso', steps: ['Acostate boca arriba con rodillas flexionadas y pies apoyados; apoyá una pesa sobre la cadera.', 'Empujá con los talones subiendo la cadera y apretando los glúteos.', 'Formá una línea recta de rodillas a hombros, sin arquear la lumbar.', 'Bajá controlada.'] }, tip: 'El empuje lo hacen los glúteos, nunca la espalda baja ni el cuello.', steps: ['Apoyá la parte media de la espalda (escápulas) contra un banco estable.', 'Colocá el peso sobre la cadera con un pad para no lastimarte.', 'Empujá la cadera al techo apretando los glúteos, sin arquear la lumbar.', 'Sostené 1 segundo arriba con el mentón cerca del pecho y la mirada al frente.'], img: '' },
        { name: 'Extensión de cuádriceps', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Sentadilla a banco', steps: ['Parada de espaldas a un banco, pies al ancho de hombros.', 'Bajá llevando la cadera atrás hasta apoyar apenas la cola en el banco, en rango cómodo.', 'Mantené las rodillas alineadas con los pies, sin que caigan hacia adentro.', 'Subí empujando con los talones, sin bloquear de golpe.'] }, steps: ['Ajustá el respaldo para que la rodilla quede alineada con el eje de giro de la máquina.', 'Colocá el rodillo sobre la parte baja de la canilla, arriba del tobillo.', 'Estirá las piernas con control dentro de un rango cómodo, sin llegar a un punto que moleste la rodilla.', 'Bajá lento, sin dejar caer el peso de golpe.'], img: '' },
        { name: 'Remo en máquina sentada', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Remo con mancuerna', steps: ['Apoyá una mano y la rodilla del mismo lado en un banco, con la espalda recta y casi paralela al piso.', 'Con la otra mano sostené la mancuerna con el brazo estirado.', 'Traccioná llevando el codo hacia atrás pegado al cuerpo, juntando la escápula.', 'Bajá controlada estirando el brazo.'] }, steps: ['Sentate con el pecho apoyado en el soporte y los pies firmes.', 'Traccioná las manijas llevando los codos hacia atrás.', 'Juntá las escápulas, sin encoger los hombros hacia las orejas.', 'Volvé controlada estirando la espalda al frente.'], img: '' },
        { name: 'Aperturas en pec deck', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Press de pecho con mancuernas', steps: ['Acostada en un banco, mancuernas a la altura del pecho con las palmas hacia los pies.', 'Empujá hacia arriba juntando levemente las mancuernas, sin bloquear de golpe los codos.', 'Bajá controlada hasta sentir el estiramiento del pecho.', 'Mantené las muñecas firmes y los hombros apoyados en el banco.'] }, steps: ['Sentate con la espalda apoyada y los antebrazos contra los almohadones.', 'Juntá los brazos al frente describiendo un arco, apretando el pecho.', 'No lleves los codos más atrás de la línea de los hombros.', 'Volvé controlada sintiendo el estiramiento del pecho.'], img: '' },
        { name: 'Face Pull en polea', sets: '3 × 15', rir: 'RIR 2-3', rest: '45s', alt: { name: 'Pájaros con mancuernas', steps: ['Inclinada hacia adelante desde la cadera, espalda recta y mancuernas livianas colgando.', 'Abrí los brazos hacia los lados llevando los codos hacia atrás, juntando las escápulas.', 'No encojas los hombros hacia las orejas; el trabajo es de la parte de atrás del hombro.', 'Bajá controlada.'] }, tip: 'No encojas los hombros hacia las orejas: el trabajo es de la parte alta de la espalda y los hombros de atrás.', steps: ['Colocá la polea a la altura de la cara con la cuerda.', 'Tomá los extremos y da un paso atrás.', 'Tirá hacia tu frente abriendo los codos y separando las manos al final.', 'Juntá las escápulas, sin encoger los hombros hacia las orejas.'], img: '' },
        { name: 'Bird-Dog', sets: '3 × 8/lado', rir: '—', rest: '45s', alt: '', steps: ['En cuadrupedia, manos bajo los hombros y rodillas bajo la cadera.', 'Extendé un brazo adelante y la pierna contraria atrás a la vez.', 'Mantené la espalda neutra y el cuello largo, sin levantar la cabeza.', 'Volvé al centro con control y cambiá de lado.'], img: '' }
      ]
    },
    cool: {
      meta: '~5 min',
      exercises: [
        { name: 'Estiramiento de glúteo/piramidal', sets: '1 min/lado', note: 'Acostada, figura de "4".', steps: ['Acostada boca arriba, cruzá un tobillo sobre la rodilla contraria formando un "4".', 'Tomá la pierna de atrás y traela suave hacia el pecho.', 'Sentí el estiramiento en el glúteo de la pierna cruzada, sin forzar.'], img: '' },
        { name: 'Estiramiento de dorsales', sets: '1 min', note: 'Manos en pared.', steps: ['Colocá las manos en una pared a la altura de los hombros y da un paso atrás.', 'Dejá caer el pecho hacia el piso estirando la espalda alta.', 'Respirá lento, manteniendo el cuello relajado.'], img: '' }
      ]
    }
  },
  {
    short: 'C',
    dayLabel: 'Full body',
    focus: 'Cuerpo completo · piernas, tracción y brazos',
    summary: 'Piernas, tracción y brazos',
    dur: '~40 min',
    warmup: {
      meta: '~7 min',
      exercises: [
        { name: 'Bici fija — ritmo suave', sets: '5 min', note: 'Entrada en calor, amable con la rodilla.', steps: ['Pedaleá a un ritmo cómodo que eleve un poco las pulsaciones sin agitarte.', 'Ajustá el asiento para que la rodilla quede apenas flexionada abajo, sin estirarse del todo.', 'Usá estos minutos para entrar en calor y soltar las piernas.'], img: '' },
        { name: 'Bird-Dog', sets: '2 × 8/lado', note: 'Activación de core.', steps: ['En cuadrupedia, manos bajo los hombros y rodillas bajo la cadera.', 'Extendé un brazo adelante y la pierna contraria atrás a la vez.', 'Mantené la espalda neutra y el cuello largo, sin levantar la cabeza.', 'Volvé al centro con control y cambiá de lado.'], img: '' }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza · Bici ya hecha en el calentamiento',
      isTable: true,
      exercises: [
        { name: 'Sentadilla goblet a banco', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Prensa de piernas', steps: ['Sentate con la espalda y la cadera bien apoyadas en el respaldo.', 'Pies en el centro de la plataforma al ancho de hombros.', 'Bajá con control solo hasta un rango cómodo, sin que la rodilla moleste.', 'Empujá sin bloquear las rodillas arriba y sin que caigan hacia adentro.'] }, steps: ['Sostené una mancuerna o pesa contra el pecho con las dos manos.', 'Parada frente a un banco, bajá llevando la cadera atrás hasta apoyar apenas la cola.', 'Mantené el pecho erguido y las rodillas alineadas con los pies, sin dejarlas caer hacia adentro.', 'Subí empujando con los talones, sin bloquear de golpe.'], img: '' },
        { name: 'Peso muerto rumano con mancuernas', sets: '3 × 10', rir: 'RIR 3', rest: '60s', alt: { name: 'Curl femoral en máquina', steps: ['Acomodate con el rodillo sobre la parte baja de la pantorrilla, arriba del talón.', 'Flexioná las rodillas llevando el talón hacia la cola.', 'Apretá el isquiotibial al final del recorrido.', 'Bajá lento, controlando el peso.'] }, tip: 'La bisagra nace de la cadera con la espalda recta, nunca desde la zona lumbar.', steps: ['Parada con mancuernas al frente de los muslos, rodillas levemente flexionadas.', 'Llevá la cadera hacia atrás bajando las mancuernas pegadas a las piernas.', 'Mantené la espalda recta; vas a sentir el estiramiento atrás del muslo.', 'Subí empujando la cadera adelante apretando los glúteos, sin redondear la espalda.'], img: '' },
        { name: 'Dominadas asistidas (máquina)', sets: '3 × 8', rir: 'RIR 3', rest: '60s', alt: { name: 'Jalón al pecho en polea', steps: ['Sentate con los muslos fijados bajo el soporte y tomá la barra un poco más ancho que los hombros.', 'Llevá la barra a la parte alta del pecho tirando con los codos hacia abajo y atrás.', 'Juntá las escápulas, sin encoger los hombros hacia las orejas.', 'Volvé arriba controlada estirando bien la espalda.'] }, steps: ['Apoyá las rodillas o los pies en la plataforma de asistencia.', 'Tomá la barra un poco más ancho que los hombros.', 'Tirá llevando el pecho hacia la barra, guiando con los codos hacia abajo.', 'Bajá controlada hasta estirar casi por completo los brazos.'], img: '' },
        { name: 'Press de hombros con mancuernas sentada', sets: '3 × 10', rir: 'RIR 3', rest: '60s', alt: { name: 'Press de hombros en máquina', steps: ['Sentate con la espalda firme contra el respaldo, sin apoyar carga sobre el cuello.', 'Tomá las manijas a la altura de los hombros.', 'Empujá hacia arriba sin bloquear de golpe los codos.', 'Bajá controlada hasta la altura de los hombros, sin encoger los hombros hacia las orejas.'] }, tip: 'Mantené la espalda apoyada en el respaldo y no lleves carga sobre el cuello.', steps: ['Sentada con respaldo casi vertical, apoyá bien la espalda sin cargar el cuello.', 'Subí las mancuernas a la altura de las orejas, palmas al frente.', 'Empujá hacia arriba en línea recta, sin bloquear de golpe los codos.', 'Bajá controlada a la altura de las orejas, sin encoger los hombros.'], img: '' },
        { name: 'Curl de bíceps', sets: '3 × 12', rir: 'RIR 2', rest: '45s', superset: 'Superserie con la extensión de tríceps', alt: '', tip: 'Superserie: encadenás este ejercicio con la extensión de tríceps sin descanso, y recién descansás al terminar la pareja.', steps: ['Parada o sentada, mancuernas a los lados con las palmas hacia el cuerpo.', 'Flexioná los codos subiendo el peso y rotando las palmas hacia arriba.', 'Mantené los codos fijos pegados al cuerpo, sin balancearte.', 'Bajá controlada hasta estirar los brazos.'], img: '' },
        { name: 'Extensión de tríceps en polea', sets: '3 × 12', rir: 'RIR 2', rest: '45s', superset: 'Superserie con el curl de bíceps', alt: '', tip: 'Superserie: va inmediatamente después del curl de bíceps, sin descanso entre los dos; descansás recién al terminar la pareja.', steps: ['Tomá la barra o cuerda de la polea alta con los codos pegados al cuerpo.', 'Estirá los brazos hacia abajo manteniendo los codos fijos en su lugar.', 'Apretá el tríceps abajo 1 segundo.', 'Subí controlada hasta que el antebrazo quede paralelo al piso.'], img: '' },
        { name: 'Dead Bug', sets: '3 × 10/lado', rir: '—', rest: '45s', alt: '', steps: ['Acostate boca arriba con brazos al techo y rodillas a 90 grados.', 'Aplaná firme la espalda baja contra el piso.', 'Extendé un brazo atrás y la pierna contraria al frente a la vez.', 'Volvé al centro lento y cambiá de lado sin despegar la lumbar.'], img: '' }
      ]
    },
    cool: {
      meta: '~5 min',
      exercises: [
        { name: 'Estiramiento de isquiotibiales en el suelo', sets: '1 min/pierna', note: 'Sentada.', steps: ['Sentate con una pierna estirada al frente y la otra flexionada hacia adentro.', 'Llevá las manos hacia el tobillo o la punta del pie sin flexionar la rodilla estirada.', 'Mantené sin rebotar, sintiendo la relajación atrás del muslo.'], img: '' },
        { name: 'Estiramiento de tríceps', sets: '1 min/lado', note: 'Brazo arriba.', steps: ['Llevá un brazo arriba y flexioná el codo dejando caer la mano detrás de la nuca.', 'Con la otra mano empujá suave el codo hacia adentro.', 'Sostené sin rebotar, manteniendo el cuello relajado.'], img: '' }
      ]
    }
  }
];

// DAYS_DATA y TOTAL_DAYS derivados de `routine`: una sola fuente de verdad para
// el resumen del tracker (arriba) y el detalle de la rutina.
const DAYS_DATA = routine.map((d, i) => ({
  id: i, short: d.short, title: d.dayLabel, name: d.summary, dur: d.dur
}));
const TOTAL_DAYS = DAYS_DATA.length;

// === MAPA CENTRAL DE IMÁGENES ===
// Fuente única de verdad. Las claves coinciden EXACTAMENTE con el nombre del ejercicio en `routine`.
// Un GIF animado por ejercicio (se anima solo). '' = sin imagen disponible.
// Los archivos van en la carpeta MEDIA_PATH ('assets/').
const MEDIA_PATH = 'assets/';
const EXERCISE_MEDIA = {
  // --- Calentamiento / activación ---
  'Sentadillas libres corporales':                      'bodyweight_squat.png',
  'Puentes de glúteo':                                  'glute_bridge.gif',
  'Bird-Dog':                                           'bird_dog.png',
  // --- Día A ---
  'Prensa de piernas':                                  'leg_press.gif',
  'Curl femoral en máquina':                            'leg_curl.gif',
  'Press de pecho en máquina':                          'chest_press.gif',
  'Jalón al pecho en polea':                            'lat_pulldown.gif',
  'Press de hombros en máquina':                        'machine_shoulder_press.gif',
  'Plancha frontal':                                    'plank.gif',
  // --- Día B ---
  'Hip thrust':                                         'hip_thrust.png',
  'Extensión de cuádriceps':                            'leg_extension.gif',
  'Remo en máquina sentada':                            'seated_row.gif',
  'Aperturas en pec deck':                              'pec_deck_fly.gif',
  'Face Pull en polea':                                 'face_pull.gif',
  // --- Día C ---
  'Sentadilla goblet a banco':                          'goblet_squat.gif',
  'Peso muerto rumano con mancuernas':                  'rdl.gif',
  'Dominadas asistidas (máquina)':                      'assisted_pullup.gif',
  'Press de hombros con mancuernas sentada':            'shoulder_press.gif',
  'Curl de bíceps':                                     'biceps_curl.gif',
  'Extensión de tríceps en polea':                      'triceps_pushdown.gif',
  'Dead Bug':                                           'dead_bug.gif',
  // --- Alternativas (toggle dentro del drawer) ---
  'Press de pecho con mancuernas':                      'dumbbell_bench_press.gif',
  'Remo con mancuerna':                                 'dumbbell_row.gif',
  'Elevaciones laterales':                              'lateral_raise.gif',
  'Pájaros con mancuernas':                             'reverse_fly.gif',
  'Puente de glúteo con peso':                          'glute_bridge.gif',
  'Sentadilla a banco':                                 'bodyweight_squat.png',
  // --- Estiramientos ---
  'Estiramiento de cuádriceps de pie':                  'stretch_quad.png',
  'Estiramiento de pectoral':                           'stretch_pec.png',
  'Estiramiento de glúteo/piramidal':                   'stretch_glute.gif',
  'Estiramiento de dorsales':                           'stretch_lat.gif',
  'Estiramiento de isquiotibiales en el suelo':         'stretch_hamstring.gif',
  'Estiramiento de tríceps':                            'stretch_triceps.gif',
  // --- Sin imagen a propósito (no hay un GIF único equivalente) ---
  'Bici fija — ritmo suave':                            '',
};

// Ejercicios sin GIF a propósito (no hay equivalente claro en el banco): no cuentan como pendientes.
const MEDIA_SIN_MATCH = [
  'Bici fija — ritmo suave',
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

// Lista de pasos de técnica como <ol>.
function stepsHTML(steps) {
  return `<ol class="ex-tech-steps">${(steps || []).map(s => `<li>${s}</li>`).join('')}</ol>`;
}

// Contenido del drawer de técnica. Si el ejercicio tiene una alternativa
// (`alt` = { name, steps }), arma un toggle Principal/Alternativa que intercambia
// pasos e imagen. Si no, muestra directamente los pasos, el tip y la imagen.
function variantDrawerHTML(e, uid) {
  if (!e.alt || !e.alt.name) {
    return `
            ${stepsHTML(e.steps)}
            ${tipHTML(e)}
            ${mediaHTML(e.name)}`;
  }
  return `
            <div class="ex-toggle">
              <button type="button" class="ex-toggle-btn active" id="tgl-main-${uid}" onclick="switchVariant('${uid}', false)">Principal</button>
              <button type="button" class="ex-toggle-btn" id="tgl-alt-${uid}" onclick="switchVariant('${uid}', true)">Alternativa</button>
            </div>
            <div class="ex-variant" id="var-main-${uid}">
              <div class="ex-variant-name">${e.name}</div>
              ${stepsHTML(e.steps)}
              ${tipHTML(e)}
              ${mediaHTML(e.name)}
            </div>
            <div class="ex-variant" id="var-alt-${uid}" style="display:none;">
              <div class="ex-variant-name">${e.alt.name} <span class="ex-variant-tag">alternativa</span></div>
              ${stepsHTML(e.alt.steps)}
              ${mediaHTML(e.alt.name)}
            </div>`;
}

// Tip / cuidado puntual de un ejercicio, dentro de su propio drawer de técnica.
// Solo aparece si el ejercicio tiene definido `tip`.
function tipHTML(e) {
  if (!e || !e.tip) return '';
  return `
            <div class="ex-tip"><span class="note-icon">💡</span>${e.tip}</div>`;
}

// Badge de superserie en el nombre del ejercicio (tabla). Si `superset` trae texto,
// se usa como tooltip aclarando con qué ejercicio se encadena.
function ssBadge(e) {
  if (!e || !e.superset) return '';
  return `<span class="tag tag-ss" title="${e.superset}">🔗 Superserie</span> `;
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
    <div class="section-toggle" data-acc data-acc-group="sections" data-acc-head>
      <span class="st-title">📋 Rutina Completa</span>
      <span class="arrow">▼</span>
    </div>
    <div class="section-content" id="routineContent">`;

  routine.forEach((day, idx) => {
    html += `
      <div class="day-card" id="dayCard${idx}" data-acc data-acc-group="days">
        <div class="day-card-header" data-acc-head>
          <div class="dch-left">
            <div class="dch-title">Día ${day.short} — ${day.dayLabel}</div>
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
        <li class="ex-item-wrap" id="w-wrap-${idx}-${eIdx}" data-acc data-acc-group="ex-${idx}">
          <div class="ex-header-click" data-acc-head>
            <span class="ex-name">${e.name}</span>
            <span class="ex-detail">${e.sets} · <span style="color:var(--text-light)">${e.note}</span></span>
          </div>
          <div class="ex-tech-drawer" id="w-tech-${idx}-${eIdx}">
            <h5>💡 Ejecución Técnica</h5>
            ${variantDrawerHTML(e, `w-${idx}-${eIdx}`)}
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
        <tr class="clickable-row" id="m-row-${idx}-${eIdx}" data-acc data-acc-group="ex-${idx}" data-acc-head>
          <td class="td-name"><span class="td-name-text">${ssBadge(e)}${e.name}</span></td>
          <td>${e.sets}</td>
          <td><span class="tag tag-rir">${e.rir}</span></td>
          <td><span class="tag tag-rest">${e.rest}</span></td>
        </tr>
        <tr class="ex-drawer-row" id="m-drawer-row-${idx}-${eIdx}"><td colspan="4">
          <div class="ex-tech-drawer" style="display:block; margin: 0; border-left-color: var(--blue);">
            <h5>💡 Ejecución Técnica</h5>
            ${variantDrawerHTML(e, `m-${idx}-${eIdx}`)}
          </div>
        </td></tr>`;
      });
      html += '</tbody></table>';
    } else {
      html += '<ul class="ex-list">';
      day.main.exercises.forEach((e, eIdx) => {
        html += `
        <li class="ex-item-wrap" id="m-wrap-${idx}-${eIdx}" data-acc data-acc-group="ex-${idx}">
          <div class="ex-header-click" data-acc-head>
            <span class="ex-name">${e.name}</span>
            <span class="ex-detail">${e.sets} · <span style="color:var(--text-light)">${e.note}</span></span>
          </div>
          <div class="ex-tech-drawer" id="m-tech-${idx}-${eIdx}" style="border-left-color: var(--blue);">
            <h5>💡 Ejecución Técnica</h5>
            ${variantDrawerHTML(e, `ml-${idx}-${eIdx}`)}
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
        <li class="ex-item-wrap" id="c-wrap-${idx}-${eIdx}" data-acc data-acc-group="ex-${idx}">
          <div class="ex-header-click" data-acc-head>
            <span class="ex-name">${e.name}</span>
            <span class="ex-detail">${e.sets} · <span style="color:var(--text-light)">${e.note}</span></span>
          </div>
          <div class="ex-tech-drawer" id="c-tech-${idx}-${eIdx}" style="border-left-color: var(--green);">
            <h5>💡 Ejecución Técnica</h5>
            ${variantDrawerHTML(e, `c-${idx}-${eIdx}`)}
          </div>
        </li>`; 
    });
    html += '</ul></div>';

    // notes (a nivel día): ya no se usan; los tips puntuales viven en el drawer
    // de cada ejercicio (ver tipHTML). Se deja tolerante por compatibilidad.
    (day.notes || []).forEach(n => {
      html += `<div class="note-box"><span class="note-icon">💡</span> ${n}</div>`;
    });

    html += '</div></div>';
  });

  html += '</div>';
  document.getElementById('routineSection').innerHTML = html;
}

// === ACCORDION (componente único) ===
// Cada colapsable lleva `data-acc` y `data-acc-group="<grupo>"`; su disparador,
// `data-acc-head`. Abrir un item cierra los demás del mismo grupo (exclusivo).
// La visibilidad del panel la resuelve el CSS según la clase `open` del item.
// Grupos: 'sections', 'days' y 'ex-<dayIdx>' (un grupo por día → exclusividad por día).
function accToggle(item) {
  const group = item.getAttribute('data-acc-group');
  const willOpen = !item.classList.contains('open');
  if (group) {
    document.querySelectorAll(`[data-acc-group="${group}"].open`).forEach(el => el.classList.remove('open'));
  }
  if (willOpen) item.classList.add('open');
}

document.addEventListener('click', (e) => {
  const head = e.target.closest('[data-acc-head]');
  if (!head) return;
  const item = head.closest('[data-acc]');
  if (item) accToggle(item);
});

// Intercambia entre el ejercicio principal y su alternativa dentro del drawer.
function switchVariant(uid, showAlt) {
  document.getElementById(`var-main-${uid}`).style.display = showAlt ? 'none' : 'block';
  document.getElementById(`var-alt-${uid}`).style.display = showAlt ? 'block' : 'none';
  document.getElementById(`tgl-main-${uid}`).classList.toggle('active', !showAlt);
  document.getElementById(`tgl-alt-${uid}`).classList.toggle('active', showAlt);
}

function renderGlossary() {
  document.getElementById('glossarySection').innerHTML = `
    <div class="section-toggle" data-acc data-acc-group="sections" data-acc-head>
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
          <p>RIR 3-4 (RPE 6-7). Cargas conservadoras: foco total en la técnica y en agarrar el hábito.</p>
        </div>
        <div class="phase-card phase-2">
          <h4>Semanas 3-4 · Progresión</h4>
          <p>RIR 2-3 (RPE 7-8). Sumá peso cuando completes todas las reps con buena forma.</p>
        </div>
        <div class="phase-card phase-3">
          <h4>Semanas 5+ · Consolidación</h4>
          <p>RIR 2 (RPE 8). Doble progresión: subí reps dentro del rango y, al tope, sumá un poco de peso.</p>
        </div>
      </div>
    </div>`;
}

// Validación de consistencia (solo desarrollo): avisa por consola si a algún día
// le falta un bloque o un campo necesario para derivar el resumen del tracker.
// No bloquea nada, solo emite console.warn.
function validateData() {
  routine.forEach((day, i) => {
    ['warmup', 'main', 'cool'].forEach(block => {
      if (!day[block]) {
        console.warn(`⚠️ El día ${i} ("${day.dayLabel || '?'}") no tiene el bloque "${block}".`);
      }
    });
    ['short', 'dayLabel', 'dur'].forEach(field => {
      if (!day[field]) {
        console.warn(`⚠️ El día ${i} no tiene el campo "${field}" (necesario para el tracker).`);
      }
    });
  });
}

// Init
validateData();
renderTracker();
renderRoutine();
renderGlossary();
