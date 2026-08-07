const tasks = [
  {
    id: "task-1",
    title: "实现任务关键字搜索",
    description: "支持按任务标题快速查找目标任务。"
  },
  {
    id: "task-2",
    title: "完善任务卡片响应式布局",
    description: "让任务卡片在桌面端和移动端都能清晰展示。"
  },
  {
    id: "task-3",
    title: "优化任务列表加载性能",
    description: "减少任务数量增加后列表加载所需的时间。"
  },
  {
    id: "js",
    title: "JavaScript 基础",
    description: "掌握 JavaScript 的基础语法和常用开发方式。"
  }
];

/**
 * Search tasks by title.
 *
 * Empty (or whitespace-only) keywords return all tasks. Matching is a
 * case-insensitive substring search and never mutates the source array.
 *
 * @param {string|undefined} keyword
 * @returns {Array<object>}
 */
function searchTasks(keyword = "") {
  if (typeof keyword !== "string") {
    throw new TypeError("keyword must be a string");
  }

  const normalizedKeyword = keyword.trim().toLocaleLowerCase();

  if (normalizedKeyword === "") {
    return tasks.slice();
  }

  return tasks.filter((task) => (
    typeof task.title === "string" &&
    task.title.toLocaleLowerCase().includes(normalizedKeyword)
  ));
}

module.exports = {
  tasks,
  searchTasks
};
