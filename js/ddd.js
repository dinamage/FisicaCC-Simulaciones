const inputAlpha = document.getElementById('inputAlpha');
const inputTheta0 = document.getElementById('inputTheta0');
const inputY0 = document.getElementById('inputY0');

const labelAlpha = document.getElementById('labelAlpha');
const labelTheta0 = document.getElementById('labelTheta0');
const labelY0 = document.getElementById('labelY0');

const resultadoYMinSim = document.getElementById('resultadoYMinSim');
const resultadoXMin = document.getElementById('resultadoXMin');
const resultadoYMinTeo = document.getElementById('resultadoYMinTeo');
const resultadoErrorDDD = document.getElementById('resultadoErrorDDD');
const resultadoThetaMin = document.getElementById('resultadoThetaMin');
const resultadoPasos = document.getElementById('resultadoPasos');
const mensajeEspejismo = document.getElementById('mensajeEspejismo');

const PARAMETROS_FIJOS_DDD = {
  n0: 1.00030,
  x0: 0.00,
  xf: 60.0,
  dx: 3.00e-3
};

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

function nOfY(y, n0, alpha) {
  return n0 + alpha * y;
}

function F(u, n0, alpha) {
  const y = u[0];
  const theta = u[1];
  const dydx = Math.tan(theta);
  const dthetadx = alpha / nOfY(y, n0, alpha);
  return [dydx, dthetadx];
}

function rk4Ray(alpha, theta0, n0, x0, y0, xf, dx) {
  const N = Math.round((xf - x0) / dx);
  const xArr = new Array(N + 1).fill(0);
  const yArr = new Array(N + 1).fill(0);
  const thetaArr = new Array(N + 1).fill(0);

  xArr[0] = x0;
  yArr[0] = y0;
  thetaArr[0] = theta0;

  let u = [y0, theta0];
  let x = x0;
  const h = dx;

  for (let i = 0; i < N; i++) {
    const k1 = F(u, n0, alpha);
    const k2 = F([u[0] + (h / 2) * k1[0], u[1] + (h / 2) * k1[1]], n0, alpha);
    const k3 = F([u[0] + (h / 2) * k2[0], u[1] + (h / 2) * k2[1]], n0, alpha);
    const k4 = F([u[0] + h * k3[0], u[1] + h * k3[1]], n0, alpha);

    u = [
      u[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      u[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    ];

    x += h;
    xArr[i + 1] = x;
    yArr[i + 1] = u[0];
    thetaArr[i + 1] = u[1];
  }

  let idxMin = 0;
  for (let i = 1; i < yArr.length; i++) {
    if (yArr[i] < yArr[idxMin]) {
      idxMin = i;
    }
  }

  return {
    N,
    xArr,
    yArr,
    thetaArr,
    idxMin,
    yMinSim: yArr[idxMin],
    xAtYMin: xArr[idxMin],
    thetaAtYMin: thetaArr[idxMin]
  };
}

function crearLayout(titulo, xTitulo, yTitulo, alto = 560) {
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
      title: xTitulo,
      tickformat: '.3g',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.35)',
      automargin: true
    },
    yaxis: {
      title: yTitulo,
      tickformat: '.4f',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.35)',
      automargin: true
    },
    legend: {
      orientation: 'v',
      x: 0.98,
      y: 0.98,
      xanchor: 'right',
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.82)',
      bordercolor: 'rgba(15,23,42,0.18)',
      borderwidth: 1
    },
    margin: { l: 84, r: 36, t: 84, b: 76 }
  };
}

function actualizarDDD() {
  const alphaMili = Number(inputAlpha.value);
  const alpha = alphaMili * 1e-3;
  const theta0 = Number(inputTheta0.value);
  const y0 = Number(inputY0.value);
  const { n0, x0, xf, dx } = PARAMETROS_FIJOS_DDD;

  labelAlpha.textContent = `${formato(alphaMili, 2)} × 10⁻³ m⁻¹`;
  labelTheta0.textContent = `${formato(theta0, 3)} rad`;
  labelY0.textContent = `${formato(y0, 2)} m`;

  const datos = rk4Ray(alpha, theta0, n0, x0, y0, xf, dx);
  const yMinTeo = (((n0 + alpha * y0) * Math.cos(theta0)) - n0) / alpha;
  const error = Math.abs(yMinTeo - datos.yMinSim) / Math.abs(yMinTeo) * 100;

  const alphaCritico = (n0 * (1 - Math.cos(theta0))) / (y0 * Math.cos(theta0));
  const hayEspejismo = alpha > alphaCritico;

  resultadoYMinSim.textContent = `${formato(datos.yMinSim, 4)} m`;
  resultadoXMin.textContent = `x = ${formato(datos.xAtYMin, 3)} m`;
  resultadoYMinTeo.textContent = `${formato(yMinTeo, 4)} m`;
  resultadoErrorDDD.textContent = `${formato(error, 4)} %`;
  resultadoThetaMin.textContent = `${formato(datos.thetaAtYMin, 5)} rad`;
  resultadoPasos.textContent = `${datos.N.toLocaleString('es-PE')}`;

  if (hayEspejismo) {
    mensajeEspejismo.className = 'validation-message validation-ok';
    mensajeEspejismo.innerHTML = `La condición de existencia del espejismo se cumple porque <strong>α = ${formato(alpha, 6)} m⁻¹</strong> es mayor que el valor crítico <strong>${formato(alphaCritico, 6)} m⁻¹</strong>.`;
  } else {
    mensajeEspejismo.className = 'validation-message validation-warning';
    mensajeEspejismo.innerHTML = `La condición de existencia del espejismo no se cumple porque <strong>α = ${formato(alpha, 6)} m⁻¹</strong> no supera el valor crítico <strong>${formato(alphaCritico, 6)} m⁻¹</strong>.`;
  }

  const trazaTrayectoria = {
    x: datos.xArr,
    y: datos.yArr,
    type: 'scatter',
    mode: 'lines',
    name: 'Trayectoria del rayo (RK4)',
    line: { width: 3 }
  };

  const trazaSuelo = {
    x: [x0, xf],
    y: [0, 0],
    type: 'scatter',
    mode: 'lines',
    name: 'Suelo (y = 0)',
    line: { width: 3, dash: 'dash' }
  };

  const trazaMinimo = {
    x: [datos.xAtYMin],
    y: [datos.yMinSim],
    type: 'scatter',
    mode: 'markers',
    name: `Punto más cercano al suelo (x=${datos.xAtYMin.toFixed(2)} m, y=${datos.yMinSim.toFixed(4)} m)`,
    marker: { size: 10 }
  };

  const trazaTheta = {
    x: datos.xArr,
    y: datos.thetaArr,
    type: 'scatter',
    mode: 'lines',
    name: 'θ(x)',
    line: { width: 3 }
  };

  const trazaThetaCero = {
    x: [x0, xf],
    y: [0, 0],
    type: 'scatter',
    mode: 'lines',
    name: 'θretorno = 0',
    line: { width: 2, dash: 'dash' }
  };

  const trazaThetaMin = {
    x: [datos.xAtYMin],
    y: [datos.thetaAtYMin],
    type: 'scatter',
    mode: 'markers',
    name: `x=${datos.xAtYMin.toFixed(2)} m, θ=${datos.thetaAtYMin.toFixed(5)} rad`,
    marker: { size: 10 }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.react(
    'graficaDDDTrayectoria',
    [trazaTrayectoria, trazaSuelo, trazaMinimo],
    crearLayout(
      'Trayectoria del rayo de luz: y vs x',
      'Posición horizontal, x (m)',
      'Altura, y (m)',
      560
    ),
    config
  );

  const layoutTheta = crearLayout(
    'Evolución angular del rayo: θ vs x',
    'Posición horizontal, x (m)',
    'Ángulo de inclinación, θ (rad)',
    560
  );
  layoutTheta.yaxis.tickformat = '.5f';

  Plotly.react(
    'graficaDDDAngulo',
    [trazaTheta, trazaThetaCero, trazaThetaMin],
    layoutTheta,
    config
  );
}

[inputAlpha, inputTheta0, inputY0].forEach(input => input.addEventListener('input', actualizarDDD));
actualizarDDD();

