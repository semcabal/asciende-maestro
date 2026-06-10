let preguntas = [];
let preguntaActual = 0;
let puntaje = 0;
let tiempoRestante = 3600;
let intervaloTiempo = null;
let opcionSeleccionada = null; // Para guardar la elección del usuario
let respondido = false; // Control para evitar múltiples envíos

// --- LÓGICA DEL MODAL DE IMÁGENES ---
const modal = document.getElementById("modal-imagen");
const imgAmpliada = document.getElementById("imagen-ampliada");
const imgPregunta = document.getElementById('img-pregunta');
const btnCerrar = document.querySelector('.cerrar-modal');

// 1. Abrir el modal desde la pregunta
imgPregunta.addEventListener('click', () => {
    modal.style.display = "block";
    imgAmpliada.src = imgPregunta.src;
    imgAmpliada.classList.remove('zoomed'); // Asegurarnos de que empiece sin zoom extra
});

// 2. Hacer clic en la imagen ampliada para hacer "Extra Zoom"
imgAmpliada.addEventListener('click', (event) => {
    event.stopPropagation(); // Evita que el clic se confunda con el fondo oscuro
    imgAmpliada.classList.toggle('zoomed'); // Pone o quita la clase de zoom
});

// 3. Cerrar el modal con el botón X
btnCerrar.addEventListener('click', () => {
    modal.style.display = "none";
    imgAmpliada.classList.remove('zoomed');
});

// 4. Cerrar si hacen clic en el fondo oscuro
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        imgAmpliada.classList.remove('zoomed');
    }
});
// ------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    fetch('preguntas.json')
        .then(res => res.json())
        .then(data => { 
            preguntas = data;
            console.log("Banco de preguntas cargado");
        });

    const btnComenzar = document.getElementById('btn-comenzar');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnEnviar = document.getElementById('btn-enviar');

    btnComenzar.addEventListener('click', () => {
        document.getElementById('pantalla-instrucciones').classList.add('oculto');
        document.getElementById('pantalla-examen').classList.remove('oculto');
        iniciarCronometro();
        mostrarPregunta();
    });

    // Selección de opción (solo guarda la variable)
    document.querySelectorAll('.opcion-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (respondido) return; // No permitir cambiar si ya se envió
            document.querySelectorAll('.opcion-btn').forEach(b => b.classList.remove('seleccionado'));
            btn.classList.add('seleccionado');
            opcionSeleccionada = index;
        });
    });

    // Lógica del botón Enviar
    btnEnviar.addEventListener('click', () => {
        if (opcionSeleccionada === null) {
            alert("¡Por favor, marca una opción primero!");
            return;
        }
        
        respondido = true;
        const correcta = preguntas[preguntaActual].correcta;
        const botones = document.querySelectorAll('.opcion-btn');
        
        // Colorear botones
        if (opcionSeleccionada === correcta) {
            botones[opcionSeleccionada].classList.add('correcta');
            puntaje++;
        } else {
            botones[opcionSeleccionada].classList.add('incorrecta');
            botones[correcta].classList.add('correcta'); // Resaltar la correcta
        }
        
        document.getElementById('bloque-retroalimentacion').classList.remove('oculto');
    });

    btnSiguiente.addEventListener('click', () => {
        preguntaActual++;
        if (preguntaActual < preguntas.length) {
            respondido = false;
            opcionSeleccionada = null;
            mostrarPregunta();
            document.getElementById('bloque-retroalimentacion').classList.add('oculto');
        } else {
            clearInterval(intervaloTiempo);
            alert("Simulacro terminado. Puntaje final: " + puntaje);
        }
    });
});

function iniciarCronometro() {
    intervaloTiempo = setInterval(() => {
        tiempoRestante--;
        let minutos = Math.floor(tiempoRestante / 60);
        let segundos = tiempoRestante % 60;
        document.getElementById('tiempo-reloj').textContent = 
            `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
        
        if (tiempoRestante <= 0) {
            clearInterval(intervaloTiempo);
            alert("¡Se acabó el tiempo!");
        }
    }, 1000);
}

function mostrarPregunta() {
    if (preguntas.length === 0) return;
    const p = preguntas[preguntaActual];
    
    document.getElementById('num-pregunta-actual').textContent = preguntaActual + 1;
    document.getElementById('texto-casuistica').textContent = p.casuistica;
    
    // --- LÓGICA PARA MOSTRAR/OCULTAR IMAGEN ---
    const imgElement = document.getElementById('img-pregunta');
    // Verificamos si la pregunta actual tiene el campo "imagen"
    if (p.imagen) {
        imgElement.src = p.imagen; // Le asignamos la ruta de la imagen
        imgElement.style.display = 'block'; // Hacemos que sea visible
    } else {
        imgElement.style.display = 'none'; // La ocultamos para que no ocupe espacio
    }
    // ------------------------------------------

    document.getElementById('opt-A').textContent = p.opciones[0];
    document.getElementById('opt-B').textContent = p.opciones[1];
    document.getElementById('opt-C').textContent = p.opciones[2];
    
    // Resetear estilos
    document.querySelectorAll('.opcion-btn').forEach(b => {
        b.classList.remove('seleccionado', 'correcta', 'incorrecta');
    });
    
    document.getElementById('bloque-retroalimentacion').classList.add('oculto');
    document.getElementById('retro-texto').textContent = p.explicacion;
}