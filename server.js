import express from "express";

const app = express();

app.get("/", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.send("URL não fornecida");

  try {
    const response = await fetch(target);

    // se for playlist
    if (target.includes(".m3u8")) {
      let data = await response.text();

      data = data.replace(/(https?:\/\/[^\s]+)/g, (match) => {
        return `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(match)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(data);
    }

    // se for vídeo/segmento
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no proxy");
  }
});

// rota proxy recursiva
app.get("/proxy", async (req, res) => {
  const target = req.query.url;

  try {
    const response = await fetch(target);

    if (target.includes(".m3u8")) {
      let data = await response.text();

      data = data.replace(/(https?:\/\/[^\s]+)/g, (match) => {
        return `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(match)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(data);
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro proxy");
  }
});

// 🔥 PORTA CORRETA
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Rodando na porta", PORT);
});
