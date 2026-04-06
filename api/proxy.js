export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url");
  }

  try {
    const response = await fetch(url, {
      redirect: "follow", // segue redirect (IMPORTANTE)
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "http://ctdg.me/",
        "Origin": "http://ctdg.me"
      }
    });

    const contentType = response.headers.get("content-type") || "";

    // ───────── PLAYLIST (.m3u8) ─────────
    if (contentType.includes("mpegurl") || url.includes(".m3u8")) {
      let text = await response.text();

      // base da URL FINAL (com token!)
      const base = response.url.split("/").slice(0, -1).join("/");

      // reescreve TODAS as linhas de mídia
      text = text.replace(/(?!#)([^\n]+)/g, (line) => {
        if (!line.trim()) return line;

        const absolute = line.startsWith("http")
          ? line
          : `${base}/${line}`;

        return `/api/proxy?url=${encodeURIComponent(absolute)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");

      return res.send(text);
    }

    // ───────── SEGMENTOS (.ts / .m4s / etc) ─────────
    const readable = response.body;

res.setHeader("Content-Type", contentType);
res.setHeader("Access-Control-Allow-Origin", "*");

if (readable) {
  readable.pipe(res);
} else {
  const buffer = await response.arrayBuffer();
  res.send(Buffer.from(buffer));
}

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.send(Buffer.from(buffer));

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).send("Erro no proxy");
  }
}
