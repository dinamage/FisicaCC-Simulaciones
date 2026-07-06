const inputA = document.getElementById('inputA');
const inputModo = document.getElementById('inputModo');

const labelA = document.getElementById('labelA');
const labelModo = document.getElementById('labelModo');

const PARAMETROS_FIJOS = {
  L: 3.00,
  FT: 150,
  mu: 2.00e-3,
  dx: 1.00e-2
};

const resultadoVelocidad = document.getElementById('resultadoVelocidad');
const resultadoFTeo = document.getElementById('resultadoFTeo');
const resultadoFSim = document.getElementById('resultadoFSim');
const resultadoError = document.getElementById('resultadoError');
const resultadoAntinodo = document.getElementById('resultadoAntinodo');
const resultadoAlpha = document.getElementById('resultadoAlpha');

function formato(valor, decimales = 3) {
  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  });
}

function formatoCifras(valor, cifras = 4) {
  return Number(valor).toLocaleString('es-PE', {
    maximumSignificantDigits: cifras
  });
}

function crearRango(inicio, fin, paso) {
  const valores = [];
  const cantidad = Math.floor((fin - inicio) / paso + 0.5);

  for (let i = 0; i <= cantidad; i++) {
    valores.push(inicio + i * paso);
  }

  return valores;
}

function encontrarPicos(y, distanciaMinima) {
  const picos = [];
  let ultimoPico = -Infinity;

  for (let i = 1; i < y.length - 1; i++) {
    const esPico = y[i] > y[i - 1] && y[i] >= y[i + 1];

    if (esPico && i - ultimoPico >= distanciaMinima) {
      picos.push(i);
      ultimoPico = i;
    }
  }

  return picos;
}

function simularCuerda(L, FT, mu, A, n, dx) {
  const v = Math.sqrt(FT / mu);
  const fTeo = n * v / (2 * L);
  const T = 1 / fTeo;
  const dt = 0.90 * dx / v;
  const alpha = v * dt / dx;

  const x = crearRango(0, L, dx);
  const N = x.length;

  const tEstabilizacion = 80 * T;
  const tFinal = tEstabilizacion + 4 * T;
  const pasos = Math.floor(tFinal / dt);

  const tiemposPerfiles = [];
  for (let k = 0; k < 5; k++) {
    tiemposPerfiles.push(tEstabilizacion + k * T / 4);
  }

  const indicesPerfiles = new Set(tiemposPerfiles.map(t => Math.floor(t / dt)));

  let yAct = x.map(pos => A * Math.sin(n * Math.PI * pos / L));
  let yAnt = yAct.slice();
  let ySig = new Array(N).fill(0);

  const perfiles = [];
  const tiemposGuardados = [];
  const tiempo = [];
  const amplitud = [];

  const xAntinodo = L / (2 * n);
  let indiceAntinodo = 0;
  let menorDistancia = Infinity;

  for (let i = 0; i < N; i++) {
    const distancia = Math.abs(x[i] - xAntinodo);
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      indiceAntinodo = i;
    }
  }

  for (let j = 0; j < pasos; j++) {
    const t = j * dt;
    tiempo.push(t);
    amplitud.push(yAct[indiceAntinodo]);

    if (indicesPerfiles.has(j)) {
      perfiles.push(yAct.slice());
      tiemposGuardados.push(t);
    }

    for (let i = 1; i < N - 1; i++) {
      ySig[i] = (
        2.0 * yAct[i]
        - yAnt[i]
        + alpha ** 2 * (yAct[i + 1] - 2.0 * yAct[i] + yAct[i - 1])
      );
    }

    ySig[0] = 0.0;
    ySig[N - 1] = 0.0;

    const temporal = yAnt;
    yAnt = yAct;
    yAct = ySig;
    ySig = temporal;
  }

  const inicio = tiempo.findIndex(t => t >= tEstabilizacion);
  const tEst = tiempo.slice(inicio);
  const aEst = amplitud.slice(inicio);
  const distanciaMinima = Math.max(1, Math.floor(0.80 * T / dt));
  const picos = encontrarPicos(aEst, distanciaMinima);

  let fSim = NaN;
  let TSim = NaN;
  let error = NaN;
  let t1 = NaN;
  let t2 = NaN;

  if (picos.length >= 2) {
    t1 = tEst[picos[0]];
    t2 = tEst[picos[1]];
    TSim = t2 - t1;
    fSim = 1 / TSim;
    error = Math.abs(fTeo - fSim) / fTeo * 100;
  }

  return {
    v,
    fTeo,
    T,
    dt,
    alpha,
    x,
    tiempo,
    amplitud,
    tEstabilizacion,
    perfiles,
    tiemposGuardados,
    xAntinodo,
    fSim,
    error,
    t1,
    t2
  };
}

function crearLayout(titulo, yTitulo, alto = 560) {
  return {
    title: {
      text: titulo,
      x: 0.5,
      xanchor: 'center',
      y: 0.96
    },
    height: alto,
    autosize: true,
    paper_bgcolor: 'rgba(255,255,255,1)',
    plot_bgcolor: 'rgba(255,255,255,1)',
    font: { family: 'Arial, sans-serif', color: '#111827' },
    xaxis: {
      title: titulo.includes('Amplitud') ? 'Tiempo (s)' : 'Posición x (m)',
      tickformat: titulo.includes('Amplitud') ? '.3f' : '.2f',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.35)',
      automargin: true
    },
    yaxis: {
      title: yTitulo,
      tickformat: '.3f',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.35)',
      automargin: true
    },
    legend: {
      orientation: 'v',
      x: 0.02,
      y: 0.02,
      xanchor: 'left',
      yanchor: 'bottom',
      bgcolor: 'rgba(255,255,255,0.82)',
      bordercolor: 'rgba(15,23,42,0.18)',
      borderwidth: 1
    },
    margin: { l: 84, r: 34, t: 76, b: 76 }
  };
}

function actualizarDDC() {
  const L = PARAMETROS_FIJOS.L;
  const FT = PARAMETROS_FIJOS.FT;
  const mu = PARAMETROS_FIJOS.mu;
  const dx = PARAMETROS_FIJOS.dx;
  const A = Number(inputA.value) * 1e-2;
  const n = Number(inputModo.value);

  labelA.textContent = `${formato(Number(inputA.value), 2)} cm`;
  labelModo.textContent = `${n}`;

  const datos = simularCuerda(L, FT, mu, A, n, dx);

  resultadoVelocidad.textContent = `${formato(datos.v, 3)} m/s`;
  resultadoFTeo.textContent = `${formato(datos.fTeo, 3)} Hz`;
  resultadoFSim.textContent = Number.isFinite(datos.fSim) ? `${formato(datos.fSim, 3)} Hz` : 'No detectada';
  resultadoError.textContent = Number.isFinite(datos.error) ? `${formato(datos.error, 3)} %` : '--';
  resultadoAntinodo.textContent = `x = ${formato(datos.xAntinodo, 3)} m`;
  resultadoAlpha.textContent = `${formato(datos.alpha, 2)}`;

  const trazasPerfiles = datos.perfiles.map((perfil, i) => ({
    x: datos.x,
    y: perfil,
    type: 'scatter',
    mode: 'lines',
    name: `t = ${datos.tiemposGuardados[i].toFixed(5)} s`,
    line: { width: 3 }
  }));

  const mascaraInicio = datos.tiempo.findIndex(t => t >= datos.tEstabilizacion);
  const tiempoEstable = datos.tiempo.slice(mascaraInicio);
  const amplitudEstable = datos.amplitud.slice(mascaraInicio);

  const trazaAmplitud = {
    x: tiempoEstable,
    y: amplitudEstable,
    type: 'scatter',
    mode: 'lines',
    name: `x = ${datos.xAntinodo.toFixed(2)} m`,
    line: { width: 3 }
  };

  const trazasPicos = [];
  if (Number.isFinite(datos.t1) && Number.isFinite(datos.t2)) {
    trazasPicos.push({
      x: [datos.t1, datos.t2],
      y: [A, A],
      type: 'scatter',
      mode: 'markers',
      name: 'Máximos usados',
      marker: { size: 9 }
    });
  }

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.react(
    'graficaDDCPerfiles',
    trazasPerfiles,
    crearLayout(`Modo estacionario n = ${n}`, 'Desplazamiento y (m)', 560),
    config
  );

  Plotly.react(
    'graficaDDCAmplitud',
    [trazaAmplitud, ...trazasPicos],
    crearLayout(`Amplitud vs tiempo (x = ${datos.xAntinodo.toFixed(2)} m)`, 'Amplitud (m)', 560),
    config
  );
}

[
  inputA,
  inputModo
].forEach(input => input.addEventListener('input', actualizarDDC));

actualizarDDC();
