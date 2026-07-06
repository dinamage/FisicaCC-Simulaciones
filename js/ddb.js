const k = 9.00e9;
const epsilon0 = 8.85e-12;
const dy = 0.01;
const yMax = 1000;

const inputLambda = document.getElementById('inputLambda');
const labelLambda = document.getElementById('labelLambda');

const resultadoNumerico = document.getElementById('resultadoNumerico');
const resultadoTeorico = document.getElementById('resultadoTeorico');
const resultadoDiferencia = document.getElementById('resultadoDiferencia');

function campoTeorico(x, lambda) {
  return lambda / (2 * Math.PI * epsilon0 * x);
}

function campoNumerico(x, lambda) {
  let E = 0;

  for (let y = 0; y < yMax; y += dy) {
    E += 2 * (k * lambda * x * dy) / ((y ** 2 + x ** 2) ** 1.5);
  }

  return E;
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

function crearLayout(titulo, alto = 500) {
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
      title: 'Distancia x (m)',
      range: [0, 82],
      dtick: 10,
      tickformat: '.3g',
      showline: true,
      linecolor: '#111827',
      mirror: true,
      gridcolor: 'rgba(15,23,42,0.16)',
      zerolinecolor: 'rgba(15,23,42,0.25)',
      automargin: true
    },
    yaxis: {
      title: 'Campo eléctrico E (N/C)',
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
      x: 0.98,
      y: 0.98,
      xanchor: 'right',
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.82)',
      bordercolor: 'rgba(15,23,42,0.18)',
      borderwidth: 1
    },
    margin: { l: 82, r: 34, t: 76, b: 76 }
  };
}

function actualizarDDB() {
  const lambdaNano = Number(inputLambda.value);
  const lambda = lambdaNano * 1e-9;

  labelLambda.textContent = `${formatoDecimal(lambdaNano, 1)} × 10⁻⁹ C/m`;

  const xValores = linspace(2.00, 80.0, 100);
  const eTeorico = xValores.map(x => campoTeorico(x, lambda));
  const eNumerico = xValores.map(x => campoNumerico(x, lambda));

  const eNumReferencia = campoNumerico(2.00, lambda);
  const eTeoReferencia = campoTeorico(2.00, lambda);
  const diferencia = Math.abs((eTeoReferencia - eNumReferencia) / eTeoReferencia) * 100;

  resultadoNumerico.textContent = `${formato3Cifras(eNumReferencia)} N/C`;
  resultadoTeorico.textContent = `${formato3Cifras(eTeoReferencia)} N/C`;
  resultadoDiferencia.textContent = `${formatoDecimal(diferencia, 3)} %`;

  const trazaNumerica = {
    x: xValores,
    y: eNumerico,
    type: 'scatter',
    mode: 'lines',
    name: 'Método numérico',
    line: { width: 3 }
  };

  const trazaTeorica = {
    x: xValores,
    y: eTeorico,
    type: 'scatter',
    mode: 'lines',
    name: 'Modelo teórico',
    line: { width: 3 }
  };

  const trazaNumericaComparacion = {
    ...trazaNumerica,
    line: { width: 3, dash: 'dash' }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.react(
    'graficaDDBNumerico',
    [trazaNumerica],
    crearLayout('Campo eléctrico vs distancia x - Método numérico', 500),
    config
  );

  Plotly.react(
    'graficaDDBTeorico',
    [trazaTeorica],
    crearLayout('Campo eléctrico vs distancia x - Modelo teórico', 500),
    config
  );

  Plotly.react(
    'graficaDDBComparacion',
    [trazaTeorica, trazaNumericaComparacion],
    crearLayout('Comparación del campo eléctrico vs distancia x', 560),
    config
  );
}

inputLambda.addEventListener('input', actualizarDDB);
actualizarDDB();
