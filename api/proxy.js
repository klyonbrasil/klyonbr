export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  try {
    const response = await fetch(url, {
      redirect: "follow", // 🔥 IMPORTANTE
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "http://ctdg.me/",
        "Origin": "http://ctdg.me"
      }
    });

    const contentType = response.headers.get("content-type") || "";

    // PLAYLIST
    if (contentType.includes("mpegurl")) {
      let text = await response.text();

      const base = response.url.split("/").slice(0, -1).join("/");

      text = text.replace(/(?!#)(.+\.ts)/g, (match) => {
        const absolute = match.startsWith("http")
          ? match
          : `${base}/${match}`;

        return `/api/proxy?url=${encodeURIComponent(absolute)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");

      return res.send(text);
    }

    // SEGMENTOS
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(Buffer.from(buffer));

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro proxy");
  }
}
