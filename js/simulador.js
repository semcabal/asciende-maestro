let preguntasOriginales = [];
let preguntasSeleccionadas = [];
let preguntaActual = 0;
let puntaje = 0;
let tiempoRestante = 3600;
let intervaloTiempo = null;
let respondido = false;
let opcionSeleccionadaTexto = null;

// Objeto para el reporte final
let contadorCategorias = {
    "Comunicación": 0, "Matemática": 0, "Indagación Científica": 0, 
    "Cognitivo": 0, "Desarrollo Personal": 0, "Expresión Corporal": 0, 
    "Expresión Gráfico-Plástica": 0
};
let totalesPorCategoria = {}; 

document.addEventListener('DOMContentLoaded', () => {
    fetch('preguntas.json')
        .then(res => res.json())
        .then(data => {
            preguntasOriginales = data.map(p => ({
                ...p,
                respuestaCorrectaTexto: p.opciones[p.correcta]
            }));
        });

    document.getElementById('btn-comenzar').addEventListener('click', iniciarExamen);
    document.getElementById('btn-enviar').addEventListener('click', verificarRespuesta);
    document.getElementById('btn-siguiente').addEventListener('click', siguientePregunta);
});

function iniciarExamen() {
    preguntasSeleccionadas = [...preguntasOriginales]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

    // Calcular cuántas preguntas hay de cada categoría en este sorteo
    totalesPorCategoria = {};
    preguntasSeleccionadas.forEach(p => {
        totalesPorCategoria[p.categoria] = (totalesPorCategoria[p.categoria] || 0) + 1;
        contadorCategorias[p.categoria] = 0; // Reiniciar contadores
    });

    preguntasSeleccionadas.forEach(p => p.opciones.sort(() => Math.random() - 0.5));

    document.getElementById('pantalla-instrucciones').classList.add('oculto');
    document.getElementById('pantalla-examen').classList.remove('oculto');
    
    iniciarCronometro();
    mostrarPregunta();
}

function mostrarPregunta() {
    const p = preguntasSeleccionadas[preguntaActual];
    document.getElementById('num-pregunta-actual').textContent = preguntaActual + 1;
    document.getElementById('texto-casuistica').textContent = p.casuistica;
    
    const imgElement = document.getElementById('img-pregunta');
    if (p.imagen) {
        imgElement.src = p.imagen;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }

    const botones = document.querySelectorAll('.opcion-btn');
    botones.forEach((btn, i) => {
        btn.querySelector('.texto-opcion').textContent = p.opciones[i];
        btn.classList.remove('seleccionado', 'correcta', 'incorrecta');
        btn.onclick = () => {
            if (respondido) return;
            botones.forEach(b => b.classList.remove('seleccionado'));
            btn.classList.add('seleccionado');
            opcionSeleccionadaTexto = p.opciones[i];
        };
    });

    document.getElementById('bloque-retroalimentacion').classList.add('oculto');
}

function verificarRespuesta() {
    if (!opcionSeleccionadaTexto) return alert("Selecciona una opción");
    respondido = true;
    
    const p = preguntasSeleccionadas[preguntaActual];
    const botones = document.querySelectorAll('.opcion-btn');

    botones.forEach(btn => {
        const texto = btn.querySelector('.texto-opcion').textContent;
        if (texto === p.respuestaCorrectaTexto) {
            btn.classList.add('correcta');
            if (opcionSeleccionadaTexto === p.respuestaCorrectaTexto) {
                puntaje++;
                contadorCategorias[p.categoria]++;
            }
        } else if (texto === opcionSeleccionadaTexto) {
            btn.classList.add('incorrecta');
        }
    });

    document.getElementById('retro-texto').textContent = p.explicacion;
    document.getElementById('bloque-retroalimentacion').classList.remove('oculto');
}

function siguientePregunta() {
    preguntaActual++;
    if (preguntaActual < preguntasSeleccionadas.length) {
        respondido = false;
        opcionSeleccionadaTexto = null;
        mostrarPregunta();
    } else {
        clearInterval(intervaloTiempo);
        mostrarResultadosFinales();
    }
}

function mostrarResultadosFinales() {
    document.getElementById('pantalla-examen').classList.add('oculto');
    const resDiv = document.getElementById('pantalla-resultados');
    resDiv.classList.remove('oculto');
    
    let htmlGrafico = `<h3>Resultado Final: ${puntaje}/20</h3><div class="contenedor-grafico">`;
    let fuertes = [];
    let mejorar = [];

    for (let cat in totalesPorCategoria) {
        let aciertos = contadorCategorias[cat] || 0;
        let total = totalesPorCategoria[cat];
        let porcentaje = (aciertos / total) * 100;
        
        if (porcentaje >= 70) fuertes.push(cat);
        else mejorar.push(cat);

        htmlGrafico += `
            <div class="fila-grafico">
                <label>${cat} (${aciertos}/${total})</label>
                <div class="barra-bg"><div class="barra-fill" style="width: ${porcentaje}%"></div></div>
            </div>`;
    }
    htmlGrafico += `</div>`;
    
    htmlGrafico += `<div class="mensaje-final">
        <p>✅ <strong>Tus áreas más fuertes:</strong> ${fuertes.length > 0 ? fuertes.join(', ') : 'Ninguna destacada'}</p>
        <p>⚠️ <strong>Áreas a mejorar:</strong> ${mejorar.length > 0 ? mejorar.join(', ') : '¡Excelente desempeño en todo!'}</p>
    </div>`;

    document.getElementById('resumen-puntaje').innerHTML = htmlGrafico;
}

function iniciarCronometro() {
    intervaloTiempo = setInterval(() => {
        tiempoRestante--;
        let min = Math.floor(tiempoRestante / 60);
        let seg = tiempoRestante % 60;
        document.getElementById('tiempo-reloj').textContent = `${min}:${seg < 10 ? '0' : ''}${seg}`;
        if (tiempoRestante <= 0) { 
            clearInterval(intervaloTiempo); 
            mostrarResultadosFinales(); 
        }
    }, 1000);
}