// for dev purposes only - serve up the code on port 8080 (or first param)
const http = require("http");
const fs = require("fs");
const path = require("path");

const DEFAULT_PORT = 8080;
const publicDir = path.join(__dirname, "/public");
const port =
  process.argv.length === 3 ? parseInt(process.argv[2]) : DEFAULT_PORT;

const server = http.createServer((req, res) => {
  try {
    const content =
      req.url === "/"
        ? fs.readFileSync(publicDir + "/umco.html")
        : fs.readFileSync(publicDir + req.url);
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
