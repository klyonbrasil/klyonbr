import http from 'http';
import https from 'https';
import url from 'url';

const PORT = process.env.PORT || 3000;

function fetchStream(target, res) {
  const client = target.startsWith('https') ? https : http;

  client.get(target, (response) => {

    // 🔥 segue redirect
    if ([301,302,303,307,308].includes(response.statusCode)) {
      return fetchStream(response.headers.location, res);
    }

    const contentType = response.headers['content-type'] || '';

    // 🔥 SE FOR M3U8 → REESCREVE
    if (contentType.includes('application/vnd.apple.mpegurl') || target.includes('.m3u8')) {
      let data = '';

      response.on('data', chunk => data += chunk);

      response.on('end', () => {

        const base = target.substring(0, target.lastIndexOf('/') + 1);

        const modified = data.split('\n').map(line => {
          if (line && !line.startsWith('#')) {
            let newUrl = line.startsWith('http') ? line : base + line;
            return `/?url=${encodeURIComponent(newUrl)}`;
          }
          return line;
        }).join('\n');

        res.writeHead(200, {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*'
        });

        res.end(modified);
      });

    } else {
      // 🔥 SEGMENTOS (.ts)
      res.writeHead(200, {
        'Content-Type': response.headers['content-type'] || 'video/mp2t',
        'Access-Control-Allow-Origin': '*'
      });

      response.pipe(res);
    }

  }).on('error', (err) => {
    res.writeHead(500);
    res.end('Erro: ' + err.message);
  });
}

const server = http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const target = query.url;

  if (!target) {
    res.writeHead(400);
    return res.end('URL não fornecida');
  }

  fetchStream(target, res);
});

server.listen(PORT, () => {
  console.log('Proxy rodando na porta ' + PORT);
});
