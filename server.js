import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.send("erro");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        "Connection": "keep-alive"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return res.send("erro ao buscar stream");
    }

    // headers IMPORTANTES pro player funcionar
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 🔥 stream direto (isso resolve o crash)
    response.body.pipe(res);

  } catch (err) {
    console.log(err);
    res.send("erro");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("rodando na porta", PORT));
