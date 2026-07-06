const g = 9.81;

const inputL = document.getElementById('inputL');
const inputH = document.getElementById('inputH');
const inputN = document.getElementById('inputN');

const labelL = document.getElementById('labelL');
const labelH = document.getElementById('labelH');
const labelN = document.getElementById('labelN');

const resultadoTrapecio = document.getElementById('resultadoTrapecio');
const resultadoTeorico = document.getElementById('resultadoTeorico');
const resultadoError = document.getElementById('resultadoError');
const mensajeValidacion = document.getElementById('mensajeValidacion');

function funcionIntegral(y, H) {
  return (0.250 * y ** 3 - y + 10.0) * (H - y);
}

function fuerzaTrapecio(H, L, n) {
  const h = H / n;
  let suma = funcionIntegral(0, H) + funcionIntegral(H, H);

  for (let i = 1; i < n; i++) {
    const y = i * h;
    suma += 2 * funcionIntegral(y, H);
  }

  const integral = (h / 2) * suma;
  return 80.0 * g * L * integral;
}

function fuerzaTeorica(H, L) {
  return 80.0 * g * L * (0.0125 * H ** 3 - H / 6 + 5) * H ** 2;
}

function porcentajeError(valorAprox, valorTeorico) {
  return Math.abs((valorTeorico - valorAprox) / valorTeorico) * 100;
}

function linspace(inicio, fin, cantidad) {
  const valores = [];
  const paso = (fin - inicio) / (cantidad - 1);

  for (let i = 0; i < cantidad; i++) {
    valores.push(inicio + i * paso);
  }

  return valores;
}

function formato3Cifras(valor) {
  return Number(valor).toLocaleString('es-PE', {
    maximumSignificantDigits: 3
  });
}

function formatoDecimal(valor, decimales) {
  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  });
}

function actualizarDDA() {
  const L = Number(inputL.value);
  const H = Number(inputH.value);
  const n = Number(inputN.value);

  labelL.textContent = `${formatoDecimal(L, 2)} m`;
  labelH.textContent = `${formatoDecimal(H, 2)} m`;
  labelN.textContent = `${n}`;

  const fuerzaNum = fuerzaTrapecio(H, L, n);
  const fuerzaTeo = fuerzaTeorica(H, L);
  const error = porcentajeError(fuerzaNum, fuerzaTeo);

  resultadoTrapecio.textContent = `${formato3Cifras(fuerzaNum)} N`;
  resultadoTeorico.textContent = `${formato3Cifras(fuerzaTeo)} N`;
  resultadoError.textContent = `${formatoDecimal(error, 4)} %`;

  if (error <= 2.0) {
    mensajeValidacion.className = 'validation-message validation-ok';
    mensajeValidacion.textContent = `Con n = ${n} trapecios, el error es ${formatoDecimal(error, 4)} %. El resultado está dentro de la tolerancia del 2,0%.`;
  } else {
    mensajeValidacion.className = 'validation-message validation-warning';
    mensajeValidacion.textContent = `Con n = ${n} trapecios, el error es ${formatoDecimal(error, 4)} %. Se recomienda aumentar n para reducir el error.`;
  }

  const hValores = linspace(1.00, 4.80, 100);
  const fTeoricaValores = hValores.map(h => fuerzaTeorica(h, L));
  const fTrapecioValores = hValores.map(h => fuerzaTrapecio(h, L, n));

  const teorica = {
    x: hValores,
    y: fTeoricaValores,
    type: 'scatter',
    mode: 'lines',
    name: 'Ecuación teórica',
    line: { width: 3 }
  };

  const trapecio = {
    x: hValores,
    y: fTrapecioValores,
    type: 'scatter',
    mode: 'lines',
    name: `Método del trapecio, n = ${n}`,
    line: { width: 3, dash: 'dash' }
  };

  const casoAsignado = {
    x: [H],
    y: [fuerzaTeo],
    type: 'scatter',
    mode: 'markers',
    name: `Caso asignado: H = ${formato3Cifras(H)} m`,
    marker: { size: 11 }
  };

  const layout = {
    title: {
      text: 'Fuerza total vs altura del fluido',
      x: 0.5,
      xanchor: 'center',
      y: 0.96
    },
    height: 560,
    autosize: true,
    paper_bgcolor: 'rgba(255,255,255,1)',
    plot_bgcolor: 'rgba(255,255,255,1)',
    font: { family: 'Arial, sans-serif', color: '#111827' },
    xaxis: {
      title: 'Altura H [m]',
      range: [0.9, 4.9],
      dtick: 0.5,
      tickformat: '.3g',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.25)',
      automargin: true
    },
    yaxis: {
      title: 'Fuerza total [N]',
      rangemode: 'tozero',
      tickformat: '.3g',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.25)',
      automargin: true
    },
    legend: {
      orientation: 'v',
      x: 0.02,
      y: 0.98,
      xanchor: 'left',
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.82)',
      bordercolor: 'rgba(15,23,42,0.18)',
      borderwidth: 1
    },
    margin: { l: 90, r: 36, t: 78, b: 78 }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.react('graficaDDA', [teorica, trapecio, casoAsignado], layout, config);
}

[inputL, inputH, inputN].forEach(input => {
  input.addEventListener('input', actualizarDDA);
});

actualizarDDA();
