const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");

const { tasks, searchTasks } = require("../src/tasks");
const { createServer } = require("../server");
const { engineeros } = require("../package.json");

test("finds a task by its complete title", () => {
  assert.deepEqual(
    searchTasks("实现任务关键字搜索").map((task) => task.id),
    ["task-1"]
  );
});

test("finds tasks by a partial title", () => {
  assert.deepEqual(
    searchTasks("任务").map((task) => task.id),
    ["task-1", "task-2", "task-3"]
  );
});

test("matching is case-insensitive", () => {
  const originalTasks = [
    { id: "js", title: "JavaScript 基础" },
    { id: "css", title: "CSS 布局" }
  ];

  const original = tasks.slice();
  tasks.splice(0, tasks.length, ...originalTasks);
  try {
    assert.deepEqual(searchTasks("javascript").map((task) => task.id), ["js"]);
    assert.deepEqual(searchTasks("cSs").map((task) => task.id), ["css"]);
  } finally {
    tasks.splice(0, tasks.length, ...original);
  }
});

test("returns all tasks for an empty or whitespace-only keyword", () => {
  assert.deepEqual(searchTasks(""), tasks);
  assert.deepEqual(searchTasks("   "), tasks);
  assert.notEqual(searchTasks(""), tasks);
});

test("rejects non-string keywords", () => {
  assert.throws(() => searchTasks(null), {
    name: "TypeError",
    message: "keyword must be a string"
  });
  assert.throws(() => searchTasks(123), {
    name: "TypeError",
    message: "keyword must be a string"
  });
});

test("returns an empty array when nothing matches", () => {
  assert.deepEqual(searchTasks("不存在的任务"), []);
});

test("exposes the search behavior through the backend API", async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const address = server.address();
  const response = await requestJson(
    `http://127.0.0.1:${address.port}/api/search?keyword=%E4%BB%BB%E5%8A%A1`
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.map((task) => task.id), [
    "task-1",
    "task-2",
    "task-3"
  ]);
});

test("configured API acceptance scenarios match the search API", async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const address = server.address();
  for (const scenario of engineeros.apiScenarios) {
    const response = await requestJson(
      `http://127.0.0.1:${address.port}${scenario.path}`
    );
    assert.equal(response.statusCode, scenario.expected.status, scenario.name);
    assert.deepEqual(
      response.body.map(({ id }) => ({ id })),
      scenario.expected.body,
      scenario.name
    );
  }
});

function requestJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        resolve({ statusCode: response.statusCode, body: JSON.parse(body) });
      });
    }).on("error", reject);
  });
}
