const express = require("express");
const cors = require("cors");
const RunwayML = require("@runwayml/sdk").default;

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

// 🔐 La API Key se obtiene desde Render
const runway = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY
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
// 🎬 GENERAR VIDEO CON RUNWAY
// =====================================

app.post("/api/generar-video", async (req, res) => {

  try {

    const {
      prompt,
      duration = 5,
      ratio = "1280:720"
    } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        ok: false,
        error: "Falta el prompt del video."
      });
    }

    console.log("🎬 VIORA recibió:", prompt);

    const task = await runway.imageToVideo.create({

      model: "gen4.5",

      promptText: prompt.trim(),

      ratio: ratio,

      duration: Number(duration)

    });

    console.log("🚀 Video enviado a Runway:", task.id);

    res.json({
      ok: true,
      taskId: task.id,
      message: "Runway comenzó a generar el video 🎬"
    });

  } catch (error) {

    console.error("❌ Error Runway:", error);

    res.status(500).json({
      ok: false,
      error: error.message || "Error al comunicarse con Runway."
    });

  }

});

// =====================================
// 🔎 CONSULTAR ESTADO DEL VIDEO
// =====================================

app.get("/api/video/:taskId", async (req, res) => {

  try {

    const taskId = req.params.taskId;

    const task = await runway.tasks.retrieve(taskId);

    res.json({
      ok: true,
      task: task
    });

  } catch (error) {

    console.error("❌ Error consultando video:", error);

    res.status(500).json({
      ok: false,
      error: error.message || "No se pudo consultar el video."
    });

  }

});

// =====================================
// 🚀 INICIAR SERVIDOR
// =====================================

app.listen(PORT, () => {

  console.log(
    `🚀 VIORA AI Backend funcionando en puerto ${PORT}`
  );

});