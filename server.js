import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.send("URL não fornecida");

  try {
    const response = await fetch(target);
    let data = await response.text();

    // 🔥 reescreve TODOS os links internos
    const base = new URL(target).origin;

    data = data.replace(/(https?:\/\/[^\s]+)/g, (match) => {
      return `/proxy?url=${encodeURIComponent(match)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(data);

  } catch (err) {
    res.status(500).send("Erro no proxy");
  }
});

// rota recursiva
app.get("/proxy", async (req, res) => {
  const target = req.query.url;

  try {
    const response = await fetch(target);

    if (target.includes(".m3u8")) {
      let data = await response.text();

      data = data.replace(/(https?:\/\/[^\s]+)/g, (match) => {
        return `/proxy?url=${encodeURIComponent(match)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(data);
    } else {
      const buffer = await response.buffer();
      res.send(buffer);
    }

  } catch {
    res.status(500).send("Erro proxy");
  }
});

app.listen(3000, () => console.log("Proxy rodando"));
