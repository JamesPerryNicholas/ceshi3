const assert = require("node:assert/strict");
const test = require("node:test");

const { tasks, searchTasks } = require("../src/tasks");

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
  assert.deepEqual(searchTasks(null), tasks);
  assert.notEqual(searchTasks(""), tasks);
});

test("returns an empty array when nothing matches", () => {
  assert.deepEqual(searchTasks("不存在的任务"), []);
});
