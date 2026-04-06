import http from 'http';
import https from 'https';
import url from 'url';

const PORT = process.env.PORT || 3000;

function fetchStream(target, res) {
  const client = target.startsWith('https') ? https : http;

  client.get(target, (response) => {

    // 🔥 SE FOR REDIRECT (resolve seu problema)
    if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
      return fetchStream(response.headers.location, res);
    }

    // headers importantes
    res.writeHead(200, {
      'Content-Type': response.headers['content-type'] || 'application/vnd.apple.mpegurl',
      'Access-Control-Allow-Origin': '*'
    });

    // stream direto (agora funciona)
    response.pipe(res);

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
