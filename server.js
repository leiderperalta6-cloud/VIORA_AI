const express = require("express");
const cors = require("cors");
const RunwayML = require("@runwayml/sdk").default;

const app = express();


// =====================================
// 🌐 CORS
// =====================================

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());


// =====================================
// ⚙️ PUERTO
// =====================================

const PORT = process.env.PORT || 10000;


// =====================================
// 🔐 RUNWAY
// =====================================

const runway = new RunwayML({
    apiKey: process.env.RUNWAYML_API_SECRET
});


// =====================================
// 🧠 ANALIZAR ERROR DE RUNWAY
// =====================================

function analizarErrorRunway(error) {

    const mensaje =
        String(
            error?.message ||
            error?.error?.message ||
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            ""
        ).toLowerCase();


    const status =
        error?.status ||
        error?.statusCode ||
        error?.response?.status ||
        null;


    // 💳 SIN CRÉDITOS

    if (
        mensaje.includes("not have enough credits") ||
        mensaje.includes("insufficient credits") ||
        mensaje.includes("insufficient balance") ||
        mensaje.includes("not enough credits") ||
        mensaje.includes("credits")
    ) {

        return {

            status: 402,

            code: "INSUFFICIENT_CREDITS",

            message:
                "VIORA no pudo crear el video porque no hay suficientes créditos disponibles en Runway en este momento. 💳🎬"

        };

    }


    // 🔐 API KEY

    if (
        status === 401 ||
        mensaje.includes("unauthorized") ||
        mensaje.includes("invalid api key") ||
        mensaje.includes("authentication")
    ) {

        return {

            status: 401,

            code: "RUNWAY_AUTH_ERROR",

            message:
                "VIORA no pudo conectarse con Runway. Revisa la configuración de la API. 🔐"

        };

    }


    // 🚦 DEMASIADAS SOLICITUDES

    if (
        status === 429 ||
        mensaje.includes("rate limit") ||
        mensaje.includes("too many requests")
    ) {

        return {

            status: 429,

            code: "RATE_LIMIT",

            message:
                "Runway está recibiendo demasiadas solicitudes. Espera unos momentos y vuelve a intentarlo. ⏳"

        };

    }


    // ❌ ERROR DE SOLICITUD

    if (
        status === 400 ||
        mensaje.includes("bad request") ||
        mensaje.includes("invalid")
    ) {

        return {

            status: 400,

            code: "RUNWAY_BAD_REQUEST",

            message:
                "Runway rechazó la solicitud de VIORA. Revisa la idea del video e inténtalo nuevamente. ⚠️"

        };

    }


    // 🌐 ERROR DEL SERVICIO

    if (
        status >= 500
    ) {

        return {

            status: 503,

            code: "RUNWAY_SERVER_ERROR",

            message:
                "Runway está presentando problemas temporales. VIORA volverá a intentarlo cuando el servicio esté disponible. 🔧"

        };

    }


    // ❓ ERROR DESCONOCIDO

    return {

        status: 500,

        code: "RUNWAY_UNKNOWN_ERROR",

        message:
            "VIORA tuvo un problema al comunicarse con el servicio de video. Inténtalo nuevamente. 🤖"

    };

}


// =====================================
// 🏠 PRUEBA DEL SERVIDOR
// =====================================

app.get("/", (req, res) => {

    res.json({

        ok: true,

        message:
            "VIORA AI Backend funcionando 🚀🤖"

    });

});


// =====================================
// ❤️ ESTADO DE LA API
// =====================================

app.get("/api/status", (req, res) => {

    res.json({

        ok: true,

        message:
            "API de VIORA AI funcionando correctamente. 💚"

    });

});


// =====================================
// 🎬 CREAR VIDEO
// =====================================

app.post("/api/generar-video", async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("🎬 SOLICITUD DE VIDEO RECIBIDA");
    console.log("=================================");


    try {

        const prompt =
            String(req.body.prompt || "").trim();


        // =================================
        // 📝 VALIDAR IDEA
        // =================================

        if (!prompt) {

            return res.status(400).json({

                ok: false,

                code: "EMPTY_PROMPT",

                error:
                    "Primero escribe una idea para el video. ✍️"

            });

        }


        console.log("💡 Idea:", prompt);


        // =================================
        // 🎥 ENVIAR A RUNWAY
        // =================================

        console.log(
            "🎥 Enviando solicitud a Runway..."
        );


        const task =
            await runway.textToVideo.create({

                model: "gen4.5",

                promptText: prompt,

                ratio: "1280:720",

                duration: 5

            });


        // =================================
        // 🆔 TAREA CREADA
        // =================================

        console.log(
            "✅ Tarea creada:",
            task.id
        );


        return res.status(200).json({

            ok: true,

            taskId: task.id,

            status: "PENDING",

            message:
                "VIORA comenzó a crear tu video. 🎬✨"

        });


    } catch (error) {


        console.error("");
        console.error(
            "❌ ERROR AL CREAR VIDEO"
        );

        console.error(
            error
        );


        const resultado =
            analizarErrorRunway(error);


        console.error(
            "Código:",
            resultado.code
        );


        // =================================
        // 💳 ERROR DE CRÉDITOS
        // =================================

        if (
            resultado.code ===
            "INSUFFICIENT_CREDITS"
        ) {

            console.log(
                "💳 Runway no tiene créditos suficientes."
            );

        }


        return res.status(
            resultado.status
        ).json({

            ok: false,

            code:
                resultado.code,

            error:
                resultado.message

        });

    }

});


// =====================================
// 🔎 CONSULTAR VIDEO
// =====================================

app.get(
    "/api/video/:taskId",
    async (req, res) => {

        try {

            const taskId =
                req.params.taskId;


            console.log(
                "🔎 Consultando tarea:",
                taskId
            );


            const task =
                await runway.tasks.retrieve(
                    taskId
                );


            return res.status(200).json({

                ok: true,

                task: task

            });


} catch (error) {

    console.error(
        "❌ ERROR RUNWAY:"
    );

    console.error(
        error
    );


    /* ==========================================
       💳 CRÉDITOS INSUFICIENTES
    ========================================== */

    const mensaje =
        String(
            error.message || error
        );


    if (
        mensaje.toLowerCase().includes(
            "credits"
        )
    ) {

        return res.status(402).json({

            ok: false,

            code:
                "INSUFFICIENT_CREDITS",

            error:
                "Runway no tiene créditos disponibles para generar este video."

        });

    }


    /* ==========================================
       ❌ ERROR GENERAL
    ========================================== */

    return res.status(500).json({

        ok: false,

        code:
            "VIDEO_GENERATION_ERROR",

        error:
            mensaje ||
            "Error al generar el video."

    });

}

    }
);


// =====================================
// 🚀 INICIAR SERVIDOR
// =====================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 VIORA AI Backend funcionando en puerto ${PORT}`
        );

    }
);
