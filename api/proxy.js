export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("URL missing");
  }

  try {
    const response = await fetch(url);

    const data = await response.arrayBuffer();

    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(Buffer.from(data));
  } catch (err) {
    res.status(500).send("Erro no proxy");
  }
}
