const http = require("node:http");
const { URL } = require("node:url");
const { searchTasks } = require("./src/tasks");

const port = Number(process.env.PORT) || 3000;

function writeJson(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "access-control-allow-origin": "*"
  });
  response.end(payload);
}

function createServer() {
  return http.createServer((request, response) => {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      response.end();
      return;
    }

    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const isSearchRoute = [
      "/api/tasks/search",
      "/tasks/search",
      "/searchTasks"
    ].includes(requestUrl.pathname);
    const isAcceptanceSearchRoute = requestUrl.pathname === "/api/search";
    const isTaskListRoute = requestUrl.pathname === "/api/tasks" &&
      requestUrl.searchParams.has("keyword");

    if (request.method === "GET" &&
      (isSearchRoute || isAcceptanceSearchRoute || isTaskListRoute)) {
      const keyword = requestUrl.searchParams.get("keyword") ?? "";
      try {
        const results = searchTasks(keyword);
        writeJson(response, 200, isAcceptanceSearchRoute ? results : { tasks: results });
      } catch (error) {
        if (error instanceof TypeError) {
          writeJson(response, 400, { error: error.message });
          return;
        }
        throw error;
      }
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/health") {
      writeJson(response, 200, { status: "ok" });
      return;
    }

    writeJson(response, 404, { error: "Not Found" });
  });
}

if (require.main === module) {
  createServer().listen(port, () => {
    console.log(`Task search API listening on http://localhost:${port}`);
  });
}

module.exports = { createServer };
