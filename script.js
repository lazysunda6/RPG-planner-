let tasks = [];
let xp = 0;
let level = 1;
const achievements = [
  "🏆 Новая надежда: выполни первую задачу!",
  "🎮 Прогрессор: +3 задачи за день!",
  "🕒 Соня: сделай задачу после обеда",
  "👑 Король продуктивности: все задачи закрыл!!"
];

// Загружаем данные из локального хранилища
function loadData() {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  xp = parseInt(localStorage.getItem("xp")) || 0;
  level = parseInt(localStorage.getItem("level")) || 1;
  renderTasks();
  updateStats();
}

// Сохраняем данные в локальное хранилище
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

// Добавление новой задачи
document.getElementById("addBtn").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput");
  if (!taskInput) return;
  const taskText = taskInput.value.trim();
  if (!taskText) return;
  tasks.push(taskText);
  renderTasks();
  taskInput.value = "";
  saveData();
});

// Обработчик клавиши Enter для добавления задачи
document.getElementById("taskInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("addBtn").click();
});

// Рендеринг списка задач
function renderTasks() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;
  taskList.innerHTML = tasks.map((task, index) =>
    `<li>
      ${task} 
      <button onclick="editTask(${index})">Редактировать</button>
      <button onclick="deleteTask(${index})">Удалить</button>
    </li>`
  ).join("");
}

// Удаление задачи
function deleteTask(index) {
  tasks.splice(index, 1); // Удаляем задачу по индексу
  saveData(); // Сохраняем изменения в локальное хранилище
  renderTasks(); // Перерисовываем список
}

// Редактирование задачи
function editTask(index) {
  const newText = prompt("Введите новый текст задачи:", tasks[index]);
  if (newText !== null && newText.trim() !== "") {
    tasks[index] = newText.trim(); // Обновляем текст задачи
    saveData(); // Сохраняем изменения в локальное хранилище
    renderTasks(); // Перерисовываем список
  }
}

// Обновление статистики
function updateStats() {
  const levelElement = document.getElementById("level");
  const xpBar = document.getElementById("xpBar");
  if (!levelElement || !xpBar) return;
  levelElement.textContent = level;
  xpBar.value = xp;
}

// Показ достижения
function showAchievement() {
  const achievementText = document.getElementById("achievementText");
  if (!achievementText) return;
  let achievement;
  if (tasks.length === 0 && level > 1) achievement = achievements[3];
  else if (level === 1 && xp === 0) achievement = achievements[0];
  else achievement = achievements[Math.floor(Math.random() * achievements.length)];
  achievementText.textContent = `Достижение: ${achievement}`;
  // Добавляем класс для анимации достижения
  achievementText.classList.add("achievement-unlock");
}

// Обработка загрузки данных при старте
window.onload = loadData;