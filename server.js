import http from 'http';
import https from 'https';
import url from 'url';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const target = query.url;

  if (!target) {
    res.writeHead(400);
    return res.end('URL não fornecida');
  }

  const client = target.startsWith('https') ? https : http;

  client.get(target, (response) => {
    let data = [];

    response.on('data', chunk => data.push(chunk));

    response.on('end', () => {
      const buffer = Buffer.concat(data);

      // se for m3u8, reescreve
      if (target.includes('.m3u8')) {
        let text = buffer.toString();

        const base = target.substring(0, target.lastIndexOf('/') + 1);

        text = text.replace(/(?!#)(.*\.ts.*)/g, (match) => {
          if (match.startsWith('http')) {
            return `/?url=${encodeURIComponent(match)}`;
          } else {
            return `/?url=${encodeURIComponent(base + match)}`;
          }
        });

        text = text.replace(/(?!#)(.*\.m3u8.*)/g, (match) => {
          if (match.startsWith('http')) {
            return `/?url=${encodeURIComponent(match)}`;
          } else {
            return `/?url=${encodeURIComponent(base + match)}`;
          }
        });

        res.writeHead(200, {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*'
        });

        return res.end(text);
      }

      // outros arquivos (ts, etc)
      res.writeHead(response.statusCode, {
        ...response.headers,
        'Access-Control-Allow-Origin': '*'
      });

      res.end(buffer);
    });

  }).on('error', (err) => {
    res.writeHead(500);
    res.end('Erro: ' + err.message);
  });
});

server.listen(PORT, () => {
  console.log('Proxy rodando na porta ' + PORT);
});
