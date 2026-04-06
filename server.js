import express from "express";

const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("sem url");

  try {
    const r = await fetch(url);

    if (url.includes(".m3u8")) {
      let text = await r.text();

      text = text.replace(/(https?:\/\/[^\s]+)/g, (m) => {
        return `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(m)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(text);
    }

    const buffer = await r.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (e) {
    console.log(e);
    res.status(500).send("erro");
  }
});

app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  try {
    const r = await fetch(url);

    if (url.includes(".m3u8")) {
      let text = await r.text();

      text = text.replace(/(https?:\/\/[^\s]+)/g, (m) => {
        return `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(m)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(text);
    }

    const buffer = await r.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (e) {
    console.log(e);
    res.status(500).send("erro proxy");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("rodando na porta", PORT);
});
