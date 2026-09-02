
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

// === RUTINA: GIMNASIO (días con técnica detallada) ===
// ⚠️ TEMPORAL: hoy NO está registrada en ROUTINES (ver más abajo) porque Vero
// entrena solo en casa. Se conserva completa e intacta para reactivarla cuando
// vuelva al gimnasio: alcanza con descomentar la línea `gym` en ROUTINES.
const GYM_DAYS = [
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
        { name: 'Pallof press en polea', sets: '3 × 10/lado', rir: '—', rest: '45s', alt: { name: 'Pallof press con banda', steps: ['Enganchá una banda elástica a un punto fijo a la altura del pecho.', 'Parada de costado a la banda, tomala con las dos manos y separate un paso para tensarla.', 'Estirá los brazos al frente resistiendo que la banda te rote el torso.', 'Volvé con control al pecho y, al terminar las reps, cambiá de lado.'] }, tip: 'No dejes que la polea te gire el tronco: el abdomen trabaja para mantenerte firme y de frente.', steps: ['Colocá la polea a la altura del pecho y tomá el agarre con las dos manos, parada de costado a la polea.', 'Separate un paso para tensar el cable; pies al ancho de hombros y rodillas apenas flexionadas.', 'Estirá los brazos al frente sin permitir que el cable te rote el torso.', 'Volvé al pecho con control, mantené el abdomen firme y, al terminar las reps, cambiá de lado.'], img: '' }
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
        { name: 'Abducción de cadera (máquina)', sets: '3 × 12', rir: 'RIR 3', rest: '60s', alt: { name: 'Abducción de cadera con banda', steps: ['Sentada o de pie, colocá una banda elástica alrededor de los muslos, justo arriba de las rodillas.', 'Abrí las rodillas hacia afuera venciendo la resistencia de la banda.', 'Apretá el glúteo medio al final del recorrido.', 'Volvé controlada sin dejar que la banda te cierre las piernas de golpe.'] }, tip: 'Mantené la espalda apoyada y el torso quieto: el movimiento sale de los glúteos, abriendo en un rango cómodo.', steps: ['Sentate en la máquina con la espalda apoyada y los almohadones contra la parte externa de los muslos.', 'Abrí las piernas empujando las rodillas hacia afuera contra la resistencia.', 'Apretá los glúteos al final de la apertura, hasta donde te sea cómodo.', 'Volvé controlada sin dejar que las piernas se cierren de golpe.'], img: '' },
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

// === RUTINA: EN CASA (kit de body pump: barra larga, barras cortas y discos) ===
// Mismo esquema que GYM_DAYS. Debe tener la MISMA cantidad de días que las demás:
// el progreso semanal es compartido.
//
// A propósito los ejercicios NO llevan `alt`: la alternativa existe para el gimnasio,
// donde una máquina puede estar ocupada o no estar. En casa el equipamiento es fijo,
// así que no aplica y el drawer se muestra sin el toggle Principal/Alternativa.
//
// Pendiente: asignar imágenes en EXERCISE_MEDIA (todavía sin GIFs). Mientras tanto
// las filas muestran el placeholder de miniatura y el detalle va sin imagen.
const HOME_DAYS = [
  {
    short: 'A',
    dayLabel: 'Full body',
    focus: 'Cuerpo completo · cuádriceps, pecho y espalda',
    summary: 'Cuádriceps, pecho y espalda',
    dur: '~40 min',
    warmup: {
      meta: '~7 min',
      exercises: [
        {
          name: 'Movilidad articular de pie',
          sets: '5 min',
          note: 'Entrada en calor sin impacto.',
          steps: [
            'Empezá con 10 círculos de hombros hacia atrás y 10 círculos amplios de brazos.',
            'Seguí con 10 rotaciones suaves de torso hacia cada lado, con la cadera quieta.',
            'Hacé 10 medias sentadillas suaves, bajando solo hasta donde te resulte cómodo.',
            'Cerrá con 10 elevaciones de talones y 8 círculos de tobillo por pie, apoyada en la silla.'
          ],
          img: ''
        },
        {
          name: 'Puente de glúteos sin peso',
          sets: '2 × 12',
          note: 'Activación de glúteos y cadera.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas y los pies apoyados al ancho de cadera.',
            'Apoyá la cabeza relajada en la colchoneta, sin empujar con la nuca.',
            'Subí la cadera apretando los glúteos hasta alinear rodillas, cadera y hombros.',
            'Bajá lento y controlado, vértebra por vértebra.'
          ],
          img: ''
        }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza',
      isTable: true,
      exercises: [
        {
          name: 'Sentadilla a la silla con peso corporal',
          sets: '3 × 12',
          rir: 'RIR 3',
          rest: '90s',
          tip: 'La silla marca el límite del rango: no bajes más profundo. Rodillas siempre apuntando a la punta de los pies.',
          steps: [
            'Parate de espaldas a la silla, pies al ancho de hombros y brazos al frente.',
            'Separá los pies con las puntas apenas hacia afuera.',
            'Bajá lento empujando la cadera hacia atrás hasta apoyarte apenas en la silla.',
            'Subí empujando el piso con todo el pie, sin que las rodillas caigan hacia adentro.'
          ],
          img: ''
        },
        {
          name: 'Flexiones en la pared',
          sets: '3 × 12',
          rir: 'RIR 3',
          rest: '60s',
          superset: 'Superserie con Remo a un brazo con disco',
          tip: 'Mantené el cuello largo: mirá hacia la pared, sin encoger los hombros hacia las orejas.',
          steps: [
            'Apoyá las manos en la pared a la altura del pecho, algo más abiertas que los hombros.',
            'Alejá los pies uno o dos pasos y mantené el cuerpo en línea recta.',
            'Bajá el pecho hacia la pared flexionando los codos, controlando el movimiento.',
            'Empujá la pared para volver, sin bloquear los codos de golpe.'
          ],
          img: ''
        },
        {
          name: 'Remo a un brazo con disco',
          sets: '3 × 12 por lado',
          rir: 'RIR 3',
          rest: '60s',
          superset: 'Superserie con Flexiones en la pared',
          tip: 'Tirá con la espalda, no con el cuello: los hombros se mantienen lejos de las orejas.',
          steps: [
            'Apoyá una mano y la rodilla del mismo lado sobre la silla, con la espalda recta.',
            'Agarrá el disco con la otra mano y dejala colgar hacia el piso.',
            'Llevá el disco hacia la cadera, llevando el codo pegado al cuerpo.',
            'Bajá lento hasta estirar el brazo, con la mirada al piso y el cuello neutro.'
          ],
          img: ''
        },
        {
          name: 'Peso muerto rumano con barra larga',
          sets: '3 × 10',
          rir: 'RIR 3',
          rest: '90s',
          tip: 'Las rodillas quedan apenas flexionadas y firmes: el movimiento sale de la cadera, no de las rodillas.',
          steps: [
            'Parate con los pies al ancho de cadera, agarrando la barra al frente de los muslos.',
            'Con la espalda recta, empujá la cadera hacia atrás bajando la barra pegada a las piernas.',
            'Bajá hasta sentir el estiramiento atrás de los muslos, sin redondear la espalda.',
            'Subí apretando los glúteos hasta quedar bien derecha.'
          ],
          img: ''
        },
        {
          name: 'Marcha supina con talón al piso',
          sets: '3 × 8 por lado',
          rir: '—',
          rest: '45s',
          tip: 'La cabeza queda apoyada y relajada todo el tiempo: nada de tensión en el cuello.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas a 90 grados y la zona lumbar apoyada.',
            'Apretá el abdomen para sostener la espalda baja en contacto con la colchoneta.',
            'Bajá un talón al piso lento, manteniendo el abdomen firme.',
            'Volvé y alterná con la otra pierna, sin despegar la espalda baja.'
          ],
          img: ''
        }
      ]
    },
    cool: {
      meta: '~5 min',
      exercises: [
        {
          name: 'Estiramiento de cuádriceps de pie con apoyo',
          sets: '45s por lado',
          note: 'Usá la pared o la silla de apoyo.',
          steps: [
            'Apoyá una mano en la pared para mantener el equilibrio.',
            'Llevá un talón hacia el glúteo agarrando el empeine con la mano libre.',
            'Mantené las rodillas juntas y la cadera apenas adelante, sin arquear la espalda.'
          ],
          img: ''
        },
        {
          name: 'Estiramiento de pecho en la pared',
          sets: '45s por lado',
          note: 'Suave, sin dolor en el hombro.',
          steps: [
            'Apoyá el antebrazo en la pared con el codo a la altura del hombro.',
            'Girá el cuerpo despacio hacia el lado contrario hasta sentir el estiramiento en el pecho.',
            'Respirá profundo y mantené los hombros bajos, lejos de las orejas.'
          ],
          img: ''
        }
      ]
    }
  },
  {
    short: 'B',
    dayLabel: 'Full body',
    focus: 'Cuerpo completo · piernas, hombros y glúteos',
    summary: 'Piernas, hombros y glúteos',
    dur: '~40 min',
    warmup: {
      meta: '~7 min',
      exercises: [
        {
          name: 'Movilidad de hombros y cadera con apoyo',
          sets: '5 min',
          note: 'Entrada en calor sin impacto.',
          steps: [
            'Apoyada en el respaldo de la silla, hacé 10 balanceos suaves de pierna al frente y atrás por lado.',
            'Seguí con 10 círculos de cadera hacia cada lado, con los pies fijos en el piso.',
            'Hacé 10 círculos de hombros hacia atrás y 10 aperturas de brazos al pecho.',
            'Cerrá con 10 elevaciones de talones lentas, apoyada en la silla.'
          ],
          img: ''
        },
        {
          name: 'Retracciones de omóplatos en la pared',
          sets: '2 × 12',
          note: 'Activación de espalda alta.',
          steps: [
            'Parate de espaldas a la pared con los brazos en W, apoyando antebrazos si podés.',
            'Juntá los omóplatos como si quisieras sostener un lápiz entre ellos.',
            'Mantené 2 segundos y aflojá, sin encoger los hombros ni tensar el cuello.'
          ],
          img: ''
        }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza',
      isTable: true,
      exercises: [
        {
          name: 'Zancada estática corta con apoyo en silla',
          sets: '3 × 10 por lado',
          rir: 'RIR 3',
          rest: '90s',
          tip: 'Paso corto y rango parcial: la rodilla de adelante no pasa la punta del pie ni cae hacia adentro.',
          steps: [
            'Parate al lado de la silla y apoyá una mano en el respaldo.',
            'Dá un paso corto hacia atrás con una pierna y quedate en esa posición.',
            'Bajá un poco flexionando ambas rodillas, sin que la de adelante pase la punta del pie.',
            'Subí empujando con la pierna de adelante y completá las repeticiones antes de cambiar.'
          ],
          img: ''
        },
        {
          name: 'Press de pecho en el piso con discos',
          sets: '3 × 12',
          rir: 'RIR 3',
          rest: '60s',
          superset: 'Superserie con Puente de glúteos con disco',
          tip: 'La cabeza y la espalda quedan siempre apoyadas: es la posición más segura para tu cervical.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas y un disco en cada mano.',
            'Con los codos apoyados en el piso, ubicá los discos a la altura del pecho.',
            'Empujá los discos hacia el techo hasta estirar los brazos, sin despegar la cabeza.',
            'Bajá lento hasta que los codos toquen suave el piso.'
          ],
          img: ''
        },
        {
          name: 'Puente de glúteos con disco',
          sets: '3 × 12',
          rir: 'RIR 3',
          rest: '60s',
          superset: 'Superserie con Press de pecho en el piso con discos',
          tip: 'El peso apoya en la cadera, nunca cerca de las costillas. El cuello queda relajado en el piso.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas y un disco apoyado sobre la cadera.',
            'Sostené el disco con las manos y apoyá bien los pies al ancho de cadera.',
            'Subí la cadera apretando los glúteos hasta alinear rodillas, cadera y hombros.',
            'Bajá lento sin apoyar del todo y repetí.'
          ],
          img: ''
        },
        {
          name: 'Press de hombros sentada con espalda en la pared',
          sets: '3 × 10',
          rir: 'RIR 3',
          rest: '90s',
          tip: 'La espalda y la cabeza se apoyan en la pared: subí solo hasta donde no encojas los hombros.',
          steps: [
            'Sentate en el piso o en la silla con la espalda y la cabeza apoyadas en la pared.',
            'Agarrá un disco en cada mano a la altura de los hombros, codos apuntando abajo.',
            'Empujá los discos hacia arriba sin despegar la espalda de la pared.',
            'Bajá lento hasta la altura de los hombros, manteniendo el cuello relajado.'
          ],
          img: ''
        },
        {
          name: 'Plancha frontal con rodillas apoyadas',
          sets: '3 × 20-30s',
          rir: '—',
          rest: '45s',
          tip: 'Mirá al piso para que el cuello siga la línea de la espalda: no levantes la cabeza.',
          steps: [
            'Apoyá los antebrazos y las rodillas en la colchoneta, codos debajo de los hombros.',
            'Adelantá un poco el peso hasta que el cuerpo quede en línea de rodillas a cabeza.',
            'Apretá el abdomen y los glúteos, respirando de forma continua.',
            'Mantené el tiempo indicado con la mirada al piso y el cuello neutro.'
          ],
          img: ''
        }
      ]
    },
    cool: {
      meta: '~5 min',
      exercises: [
        {
          name: 'Estiramiento de isquiotibiales con talón en la silla',
          sets: '45s por lado',
          note: 'Espalda recta, sin rebotar.',
          steps: [
            'Apoyá un talón sobre el asiento de la silla con la pierna casi estirada.',
            'Con la espalda recta, inclinate apenas hacia adelante desde la cadera.',
            'Mantené la posición respirando profundo, sin forzar la rodilla.'
          ],
          img: ''
        },
        {
          name: 'Estiramiento de glúteo acostada (figura 4)',
          sets: '45s por lado',
          note: 'Cabeza siempre apoyada.',
          steps: [
            'Acostate boca arriba y cruzá un tobillo sobre la rodilla contraria.',
            'Agarrá el muslo de la pierna de apoyo y llevalo suave hacia el pecho.',
            'Mantené la cabeza y los hombros apoyados, sin levantar el cuello.'
          ],
          img: ''
        }
      ]
    }
  },
  {
    short: 'C',
    dayLabel: 'Full body',
    focus: 'Cuerpo completo · cadena posterior, pecho y dorsales',
    summary: 'Glúteos, pecho y dorsales',
    dur: '~40 min',
    warmup: {
      meta: '~7 min',
      exercises: [
        {
          name: 'Movilidad de cadera y tobillo con apoyo',
          sets: '5 min',
          note: 'Entrada en calor sin impacto.',
          steps: [
            'Apoyada en la silla, hacé 10 balanceos suaves de pierna hacia adelante y atrás por lado.',
            'Seguí con 8 círculos de tobillo por pie, en cada dirección.',
            'Hacé 10 medias sentadillas suaves, sin bajar más de lo cómodo.',
            'Cerrá con 10 rotaciones de torso y 10 círculos de hombros hacia atrás.'
          ],
          img: ''
        },
        {
          name: 'Almejas acostada de lado',
          sets: '2 × 12 por lado',
          note: 'Activación de glúteo medio.',
          steps: [
            'Acostate de lado con las rodillas flexionadas y la cabeza apoyada en el brazo.',
            'Con los talones juntos, abrí la rodilla de arriba como una almeja.',
            'Bajá lento sin rotar la cadera hacia atrás y repetí.'
          ],
          img: ''
        }
      ]
    },
    main: {
      meta: 'Bloque de Fuerza',
      isTable: true,
      exercises: [
        {
          name: 'Sentadilla goblet a la silla',
          sets: '3 × 12',
          rir: 'RIR 3',
          rest: '90s',
          tip: 'Sostené el disco pegado al pecho y el torso erguido: si te vas hacia adelante, usá menos peso.',
          steps: [
            'Parate de espaldas a la silla con un disco agarrado contra el pecho.',
            'Separá los pies al ancho de hombros, con las puntas apenas hacia afuera.',
            'Bajá lento empujando la cadera hacia atrás hasta rozar la silla, sin sentarte del todo.',
            'Subí empujando con toda la planta del pie, cuidando que las rodillas no caigan hacia adentro.'
          ],
          img: ''
        },
        {
          name: 'Puente de glúteos con marcha',
          sets: '3 × 10 por lado',
          rir: 'RIR 3',
          rest: '90s',
          tip: 'Mantené la cadera arriba y pareja: si se te cae de un lado, bajá el rango o apoyá el pie antes.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas y los pies apoyados al ancho de cadera.',
            'Subí la cadera apretando los glúteos y mantenela arriba.',
            'Despegá un pie del piso llevando la rodilla hacia el pecho, sin que caiga la cadera.',
            'Apoyá y alterná con la otra pierna, con el cuello relajado en la colchoneta.'
          ],
          img: ''
        },
        {
          name: 'Aperturas con discos en el piso',
          sets: '3 × 12',
          rir: 'RIR 3',
          rest: '60s',
          superset: 'Superserie con Pullover con disco en el piso',
          tip: 'El piso frena el rango por vos: no busques bajar más allá de que los codos lo toquen. La cabeza queda apoyada todo el tiempo.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas y un disco en cada mano.',
            'Estirá los brazos hacia el techo con los codos apenas flexionados y las palmas enfrentadas.',
            'Abrí los brazos hacia los costados bajando lento hasta que los codos toquen suave el piso.',
            'Volvé a juntarlos arriba apretando el pecho, sin chocar los discos.'
          ],
          img: ''
        },
        {
          name: 'Pullover con disco en el piso',
          sets: '3 × 12',
          rir: 'RIR 2',
          rest: '60s',
          superset: 'Superserie con Aperturas con discos en el piso',
          tip: 'Bajá solo hasta donde la espalda baja no se despegue del piso. La cabeza queda siempre apoyada.',
          steps: [
            'Acostate boca arriba con las rodillas flexionadas y un disco agarrado a dos manos.',
            'Estirá los brazos hacia el techo por encima del pecho, cabeza apoyada.',
            'Bajá el disco lento por detrás de la cabeza con los codos apenas flexionados.',
            'Volvé a subir hasta el pecho apretando los dorsales, sin arquear la espalda baja.'
          ],
          img: ''
        },
        {
          name: 'Elevaciones laterales con discos',
          sets: '3 × 12',
          rir: 'RIR 2',
          rest: '60s',
          tip: 'Subí solo hasta la altura de los hombros y sin encogerlos: si el trapecio tira del cuello, usá menos peso.',
          steps: [
            'Parate con un disco en cada mano a los costados del cuerpo.',
            'Con los codos apenas flexionados, subí los brazos hacia los costados.',
            'Frená a la altura de los hombros, sin encogerlos hacia las orejas.',
            'Bajá lento y controlado hasta los muslos.'
          ],
          img: ''
        },
        {
          name: 'Perro de caza (bird-dog)',
          sets: '3 × 8 por lado',
          rir: '—',
          rest: '45s',
          tip: 'La mirada va al piso todo el tiempo: el cuello sigue la línea de la espalda, no la levantes.',
          steps: [
            'Ponete en cuatro apoyos, con las manos bajo los hombros y las rodillas bajo la cadera.',
            'Apretá el abdomen y estirá lento un brazo al frente y la pierna contraria atrás.',
            'Mantené 2 segundos con la cadera estable, sin arquear la espalda.',
            'Volvé con control y repetí con el otro lado.'
          ],
          img: ''
        }
      ]
    },
    cool: {
      meta: '~5 min',
      exercises: [
        {
          name: 'Estiramiento de dorsales con manos en la silla',
          sets: '1 min',
          note: 'Cabeza entre los brazos, sin colgarla.',
          steps: [
            'Apoyá las dos manos en el asiento de la silla y caminá los pies hacia atrás.',
            'Bajá el pecho entre los brazos con la espalda larga, cadera hacia atrás.',
            'Dejá la cabeza alineada entre los brazos, respirando profundo.'
          ],
          img: ''
        },
        {
          name: 'Gato-camello suave',
          sets: '8 reps lentas',
          note: 'Movimiento amplio pero sin forzar.',
          steps: [
            'Ponete en cuatro apoyos con las manos bajo los hombros.',
            'Al exhalar, redondeá la espalda mirando hacia el ombligo, sin tirar del cuello.',
            'Al inhalar, dejá caer suave la panza y llevá la mirada apenas al frente, sin extender el cuello al máximo.'
          ],
          img: ''
        }
      ]
    }
  }
];

// === REGISTRO DE RUTINAS ===
// El progreso semanal (semanas, fases y días cumplidos) es COMPARTIDO entre rutinas:
// se sigue guardando en STORAGE_KEY. Acá solo se recuerda cuál está seleccionada.
//
// ⚠️ TEMPORAL: la rutina de GIMNASIO está comentada a propósito porque Vero está
// entrenando solo en casa. Sus días (GYM_DAYS, más arriba) se conservan intactos.
// Para volver a habilitarla cuando regrese al gimnasio: descomentá la línea `gym`.
// Con una sola rutina registrada, el selector se oculta solo (ver renderRoutineSwitch);
// al descomentarla vuelve a aparecer automáticamente.
const ROUTINES = {
  // gym:  { id: 'gym',  label: 'Gimnasio', sub: '3 días · Full body · Acondicionamiento general', days: GYM_DAYS },
  casa: { id: 'casa', label: 'En casa',  sub: '3 días · Full body · En casa, sin máquinas',     days: HOME_DAYS },
};
const ROUTINE_KEY = 'rutina_vero_activa';

function loadActiveRoutine() {
  try {
    const v = localStorage.getItem(ROUTINE_KEY);
    if (v && ROUTINES[v]) return v;
  } catch (e) {}
  // Cae a la primera rutina registrada (así sigue funcionando aunque alguna esté
  // comentada, o si quedó guardada una rutina que ya no está disponible).
  return Object.keys(ROUTINES)[0];
}

let activeRoutineId = loadActiveRoutine();

// `routine` son los días de la rutina activa. DAYS_DATA/TOTAL_DAYS se derivan de
// ahí (fuente única de verdad); si la rutina activa todavía no tiene días
// cargados, el tracker cae a los de gimnasio para no romperse.
function deriveDaysData(days) {
  return days.map((d, i) => ({ id: i, short: d.short, title: d.dayLabel, name: d.summary, dur: d.dur }));
}

let routine = ROUTINES[activeRoutineId].days;
let DAYS_DATA = deriveDaysData(routine.length ? routine : GYM_DAYS);
let TOTAL_DAYS = DAYS_DATA.length;

// Cambia la rutina activa y re-renderiza todo lo que depende de ella.
function setRoutine(id) {
  if (!ROUTINES[id] || id === activeRoutineId) return;
  activeRoutineId = id;
  try { localStorage.setItem(ROUTINE_KEY, id); } catch (e) {}
  routine = ROUTINES[id].days;
  DAYS_DATA = deriveDaysData(routine.length ? routine : GYM_DAYS);
  TOTAL_DAYS = DAYS_DATA.length;
  applyRoutineChrome();
  renderRoutine();
  renderTracker();
}

// Sincroniza el subtítulo del encabezado y el estado del selector.
function applyRoutineChrome() {
  const sub = document.querySelector('.header .sub');
  if (sub) sub.textContent = ROUTINES[activeRoutineId].sub;
  document.querySelectorAll('.rt-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.routine === activeRoutineId);
  });
}

// Selector segmentado de rutina (arriba de la pestaña Rutina).
// Con una sola rutina registrada no hay nada que elegir: se oculta para no meter
// ruido visual. Vuelve a aparecer solo al registrar una segunda rutina.
function renderRoutineSwitch() {
  const el = document.getElementById('routineSwitch');
  if (!el) return;
  const rutinas = Object.values(ROUTINES);
  el.hidden = rutinas.length < 2;
  el.innerHTML = el.hidden ? '' : rutinas.map(r =>
    `<button type="button" class="rt-btn${r.id === activeRoutineId ? ' active' : ''}" data-routine="${r.id}">${r.label}</button>`
  ).join('');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-routine]');
  if (btn) setRoutine(btn.dataset.routine);
});

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
  'Pallof press en polea':                              'pallof_press.gif',
  // --- Día B ---
  'Abducción de cadera (máquina)':                      'hip_abduction.gif',
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

  // ============ RUTINA EN CASA ============
  // --- Calentamiento / activación ---
  'Puente de glúteos sin peso':                         'glute_bridge.gif',
  // --- Día A ---
  'Sentadilla a la silla con peso corporal':            'bodyweight_squat.png',
  'Flexiones en la pared':                              'wall_pushup.gif',
  'Remo a un brazo con disco':                          'dumbbell_row.gif',
  'Peso muerto rumano con barra larga':                 'barbell_rdl.gif',
  'Marcha supina con talón al piso':                    'dead_bug.gif',
  // --- Día B ---
  'Zancada estática corta con apoyo en silla':          'split_squat.gif',
  'Press de pecho en el piso con discos':               'dumbbell_bench_press.gif',
  'Puente de glúteos con disco':                        'glute_bridge.gif',
  'Press de hombros sentada con espalda en la pared':   'shoulder_press.gif',
  'Plancha frontal con rodillas apoyadas':              'plank.gif',
  'Retracciones de omóplatos en la pared':              'scapular_retraction.gif',
  // --- Día C ---
  'Sentadilla goblet a la silla':                       'goblet_squat.gif',
  'Puente de glúteos con marcha':                       'glute_bridge_march.gif',
  'Aperturas con discos en el piso':                    'chest_fly.gif',
  'Pullover con disco en el piso':                      'pullover.gif',
  'Elevaciones laterales con discos':                   'lateral_raise.gif',
  'Perro de caza (bird-dog)':                           'bird_dog.png',
  'Almejas acostada de lado':                           'clamshell.gif',
  // --- Estiramientos ---
  'Estiramiento de cuádriceps de pie con apoyo':        'stretch_quad.png',
  'Estiramiento de pecho en la pared':                  'stretch_pec.png',
  'Estiramiento de isquiotibiales con talón en la silla': 'stretch_hamstring.gif',
  'Estiramiento de glúteo acostada (figura 4)':         'stretch_glute.gif',
  'Estiramiento de dorsales con manos en la silla':     'stretch_lat.gif',
  'Gato-camello suave':                                 'cat_cow.gif',

  // --- Sin imagen a propósito (no hay un GIF único equivalente) ---
  'Bici fija — ritmo suave':                            '',
  'Movilidad articular de pie':                         '',
  'Movilidad de hombros y cadera con apoyo':            '',
  'Movilidad de cadera y tobillo con apoyo':            '',
};

// Ejercicios sin GIF a propósito (no hay equivalente claro en el banco): no cuentan como pendientes.
// Los circuitos de movilidad son secuencias de varios movimientos: ningún GIF único los representa.
const MEDIA_SIN_MATCH = [
  'Bici fija — ritmo suave',
  'Movilidad articular de pie',
  'Movilidad de hombros y cadera con apoyo',
  'Movilidad de cadera y tobillo con apoyo',
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

// Línea de descripción atenuada de un ejercicio. Principal: "sets · RIR · rest";
// calentamiento/calma: "sets · nota". Filtra valores vacíos o "—".
function metaText(e, isMain) {
  const parts = isMain ? [e.sets, e.rir, e.rest] : [e.sets, e.note];
  return parts.filter(p => p && p !== '—').join(' · ');
}

// Miniatura del ejercicio a la izquierda del nombre. Usa una versión estática
// (primer frame, en assets/thumbs/) para no animar decenas de GIFs a la vez; el
// GIF animado completo se ve al desplegar el detalle. Sin imagen → placeholder.
function thumbHTML(e) {
  const gif = getMedia(e.name);
  if (gif) {
    const thumb = 'thumbs/' + gif.replace(/\.\w+$/, '.jpg');
    return `<div class="ex-thumb"><img src="${MEDIA_PATH}${thumb}" alt="" loading="lazy"></div>`;
  }
  return `<div class="ex-thumb ex-thumb-empty" aria-hidden="true">🏋️</div>`;
}

// Fila plana de ejercicio (mismo componente para principal y calentamiento/calma).
// Miniatura + nombre en acento + descripción atenuada + chevron a la derecha; el
// detalle (pasos + toggle alternativa + tip + imagen) se despliega debajo, sin cajas.
function exRowHTML(e, dayIdx, eIdx, prefix, isMain) {
  return `
            <div class="ex" data-acc data-acc-group="ex-${dayIdx}">
              <div class="ex-head" data-acc-head>
                ${thumbHTML(e)}
                <div class="ex-gr">
                  <div class="ex-name">${ssBadge(e)}${e.name}</div>
                  <div class="ex-meta">${metaText(e, isMain)}</div>
                </div>
                <span class="chev" aria-hidden="true">▾</span>
              </div>
              <div class="ex-body">${variantDrawerHTML(e, `${prefix}-${dayIdx}-${eIdx}`)}</div>
            </div>`;
}

// Subsección plegable secundaria (calentamiento / vuelta a la calma).
// Grupo propio por día (wu-/cd-) → togglea independiente. Los ejercicios internos
// usan el grupo del día (ex-<idx>) para la exclusividad del detalle.
function subBlockHTML(block, icon, title, group, dayIdx, prefix) {
  let items = '';
  block.exercises.forEach((e, eIdx) => { items += exRowHTML(e, dayIdx, eIdx, prefix, false); });
  return `
          <div class="subblock" data-acc data-acc-group="${group}">
            <div class="subblock-head" data-acc-head>
              <span class="subblock-title">${icon} ${title} · ${block.meta}</span>
              <span class="chev" aria-hidden="true">▾</span>
            </div>
            <div class="subblock-body">${items}</div>
          </div>`;
}

function renderRoutine() {
  // Rutina todavía sin días cargados: estado vacío en vez de una lista en blanco.
  if (!routine.length) {
    document.getElementById('routineSection').innerHTML =
      `<div class="rt-empty">Esta rutina todavía no está cargada.</div>`;
    return;
  }

  let html = '';

  routine.forEach((day, idx) => {
    let main = '';
    day.main.exercises.forEach((e, eIdx) => { main += exRowHTML(e, idx, eIdx, 'm', true); });

    html += `
      <div class="day" id="dayCard${idx}" data-acc data-acc-group="days">
        <div class="day-head" data-acc-head>
          <div class="day-gr">
            <div class="day-title">Día ${day.short} — ${day.dayLabel}</div>
            <div class="day-sub">${day.focus} · ${day.dur}</div>
          </div>
          <span class="chev" aria-hidden="true">▾</span>
        </div>
        <div class="day-body">
          ${subBlockHTML(day.warmup, '🔥', 'Entrada en calor', `wu-${idx}`, idx, 'w')}
          <div class="seclbl">Bloque principal</div>
          ${main}
          ${subBlockHTML(day.cool, '🧊', 'Vuelta a la calma', `cd-${idx}`, idx, 'c')}
        </div>
      </div>`;
  });

  document.getElementById('routineSection').innerHTML = html;
  openNextPendingDay();
}

// Abre automáticamente el primer día no hecho de la semana actual (una vez al cargar).
function openNextPendingDay() {
  const s = loadState();
  const days = getWeekDays(s, s.currentWeek);
  let idx = days.findIndex(d => !d);
  if (idx < 0) idx = 0;
  const card = document.getElementById('dayCard' + idx);
  if (!card) return;
  document.querySelectorAll('.day.open').forEach(c => c.classList.remove('open'));
  card.classList.add('open');
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
  if (willOpen) {
    item.classList.add('open');
    // Al abrir un día, llevar su fila al inicio para no quedar a mitad de pantalla.
    if (item.classList.contains('day')) {
      requestAnimationFrame(() => item.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }
}

document.addEventListener('click', (e) => {
  const head = e.target.closest('[data-acc-head]');
  if (!head) return;
  const item = head.closest('[data-acc]');
  if (item) accToggle(item);
});

// === PESTAÑAS (barra de navegación inferior) ===
// Click en un [data-tab] activa su botón y muestra su panel; oculta los demás.
function switchTab(name) {
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => {
    const on = p.id === `tab-${name}`;
    p.classList.toggle('active', on);
    p.hidden = !on;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' }); // arranca arriba al cambiar de pestaña
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tab]');
  if (btn) switchTab(btn.dataset.tab);
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
  const cargadas = Object.values(ROUTINES).filter(r => r.days.length);
  cargadas.forEach(r => {
    r.days.forEach((day, i) => {
      ['warmup', 'main', 'cool'].forEach(block => {
        if (!day[block]) {
          console.warn(`⚠️ [${r.id}] El día ${i} ("${day.dayLabel || '?'}") no tiene el bloque "${block}".`);
        }
      });
      ['short', 'dayLabel', 'dur'].forEach(field => {
        if (!day[field]) {
          console.warn(`⚠️ [${r.id}] El día ${i} no tiene el campo "${field}" (necesario para el tracker).`);
        }
      });
    });
  });
  // El progreso semanal es compartido: todas las rutinas cargadas deben tener
  // la misma cantidad de días para que los días marcados coincidan.
  const largos = [...new Set(cargadas.map(r => r.days.length))];
  if (largos.length > 1) {
    console.warn(`⚠️ Las rutinas cargadas tienen distinta cantidad de días (${cargadas.map(r => `${r.id}:${r.days.length}`).join(', ')}). El progreso es compartido, deberían coincidir.`);
  }
}

// Init
validateData();
renderRoutineSwitch();
applyRoutineChrome();
renderTracker();
renderRoutine();
renderGlossary();
