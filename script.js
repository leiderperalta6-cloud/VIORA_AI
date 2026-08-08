// =====================================
// 🚀 VIORA AI - SCRIPT PRINCIPAL
// =====================================

// URL de nuestro backend en Render
const API_URL = "https://viora-ai-5n6m.onrender.com";

// =====================================
// 📄 ABRIR PÁGINAS
// =====================================

function abrirPagina(pagina) {
    window.location.href = pagina;
}


// =====================================
// 🎥 SELECCIONAR VIDEO
// =====================================

const videoInput = document.getElementById("videoInput");

if (videoInput) {

    videoInput.addEventListener("change", function () {

        const nombre =
            this.files[0]?.name ||
            "Ningún video seleccionado.";

        const nombreVideo =
            document.getElementById("nombreVideo");

        if (nombreVideo) {
            nombreVideo.textContent = nombre;
        }

    });

}


// =====================================
// 🤖 CREAR VIDEO CON VIORA
// =====================================

async function generarVideo() {

    // Buscar el campo donde el usuario escribe la idea
    const promptElement =
        document.getElementById("prompt");

    if (!promptElement) {

        alert(
            "No encontramos el campo de instrucciones de VIORA."
        );

        return;
    }


    const prompt =
        promptElement.value.trim();


    // Comprobar que haya una idea
    if (!prompt) {

        alert(
            "Primero escribe una idea para tu video. 🎬"
        );

        return;
    }


    // Buscar botón
    const boton =
        document.getElementById("crearVideo");


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "⏳ VIORA está creando...";
    }


    try {

        console.log(
            "🤖 Enviando idea a VIORA:",
            prompt
        );


        // Enviar la idea al backend
        const respuesta =
            await fetch(
                `${API_URL}/api/generar-video`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        prompt: prompt,

                        duration: 5,

                        ratio: "1280:720"

                    })

                }
            );


        const datos =
            await respuesta.json();


        console.log(
            "📡 Respuesta del servidor:",
            datos
        );


        // Comprobar error
        if (!respuesta.ok || !datos.ok) {

            throw new Error(
                datos.error ||
                "No se pudo iniciar la generación."
            );

        }


        // Mostrar mensaje
        alert(
            "🎬 ¡VIORA comenzó a crear tu video!\n\n" +
            "La generación puede tardar unos momentos."
        );


        console.log(
            "🆔 ID de tarea:",
            datos.taskId
        );


        // Comenzar a comprobar el estado
        consultarVideo(
            datos.taskId
        );


    } catch (error) {

        console.error(
            "❌ Error:",
            error
        );


        alert(
            "❌ VIORA encontró un problema:\n\n" +
            error.message
        );


    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "🎬 Crear con VIORA";

        }

    }

}


// =====================================
// 🔎 CONSULTAR VIDEO
// =====================================

async function consultarVideo(taskId) {

    try {

        console.log(
            "🔎 Consultando video:",
            taskId
        );


        const respuesta =
            await fetch(
                `${API_URL}/api/video/${taskId}`
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || !datos.ok) {

            throw new Error(
                datos.error ||
                "No se pudo consultar el video."
            );

        }


        const tarea =
            datos.task;


        console.log(
            "📊 Estado:",
            tarea.status
        );


        // =================================
        // 🎉 VIDEO TERMINADO
        // =================================

        if (
            tarea.status ===
            "SUCCEEDED"
        ) {

            const videoURL =
                tarea.output?.[0];


            if (videoURL) {

                mostrarVideo(
                    videoURL
                );

            }

            return;
        }


        // =================================
        // ❌ VIDEO FALLÓ
        // =================================

        if (
            tarea.status ===
            "FAILED"
        ) {

            alert(
                "❌ Runway no pudo generar el video."
            );

            return;
        }


        // =================================
        // ⏳ TODAVÍA GENERANDO
        // =================================

        setTimeout(
            () => {

                consultarVideo(
                    taskId
                );

            },
            5000
        );


    } catch (error) {

        console.error(
            "❌ Error consultando:",
            error
        );

        alert(
            "❌ Error comprobando el video:\n\n" +
            error.message
        );

    }

}


// =====================================
// 🎥 MOSTRAR VIDEO
// =====================================

function mostrarVideo(videoURL) {

    let contenedor =
        document.getElementById(
            "videoResultado"
        );


    // Crear contenedor si no existe
    if (!contenedor) {

        contenedor =
            document.createElement(
                "div"
            );

        contenedor.id =
            "videoResultado";

        document.body.appendChild(
            contenedor
        );

    }


    contenedor.innerHTML = `

        <div style="
            margin-top:30px;
            text-align:center;
        ">

            <h2>
                🎉 ¡Tu video está listo!
            </h2>

            <video
                controls
                autoplay
                style="
                    width:100%;
                    max-width:800px;
                    border-radius:15px;
                "
            >

                <source
                    src="${videoURL}"
                    type="video/mp4"
                >

                Tu navegador no puede reproducir este video.

            </video>

            <br><br>

            <a
                href="${videoURL}"
                target="_blank"
                rel="noopener noreferrer"
            >
                🎬 Abrir video
            </a>

        </div>

    `;


    // Llevar al usuario hacia el video
    contenedor.scrollIntoView({
        behavior: "smooth"
    });

}
