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
// 🏠 PRUEBA DEL SERVIDOR
// =====================================

app.get("/", (req, res) => {

    res.json({
        ok: true,
        message: "VIORA AI Backend funcionando 🚀🤖"
    });

});


// =====================================
// ❤️ PRUEBA DE API
// =====================================

app.get("/api/status", (req, res) => {

    res.json({
        ok: true,
        message: "API de VIORA AI funcionando correctamente."
    });

});


// =====================================
// 🎬 CREAR VIDEO
// =====================================

app.post("/api/generar-video", async (req, res) => {

    console.log("=================================");
    console.log("🎬 SOLICITUD DE VIDEO RECIBIDA");
    console.log("=================================");

    try {

        const prompt =
            String(req.body.prompt || "").trim();


        if (!prompt) {

            return res.status(400).json({

                ok: false,

                error:
                    "Falta la idea del video."

            });

        }


        console.log(
            "💡 Idea:",
            prompt
        );


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


        console.log(
            "🆔 Tarea creada:",
            task.id
        );


        return res.json({

            ok: true,

            taskId: task.id,

            message:
                "VIORA comenzó a crear el video 🎬"

        });


    } catch (error) {


        console.error(
            "❌ ERROR RUNWAY:"
        );

        console.error(
            error
        );


        return res.status(500).json({

            ok: false,

            error:
                error.message ||
                "Error al generar el video."

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


            return res.json({

                ok: true,

                task: task

            });


        } catch (error) {


            console.error(
                "❌ Error consultando tarea:"
            );

            console.error(
                error
            );


            return res.status(500).json({

                ok: false,

                error:
                    error.message ||
                    "No se pudo consultar el video."

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
