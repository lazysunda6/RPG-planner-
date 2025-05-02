document.getElementById("addBtn").addEventListener("click", () => {
    const taskText = document.getElementById("taskInput").value.trim();
    if (!taskText) return;
    tasks.push(taskText);
    renderTasks();
    document.getElementById("taskInput").value = "";
});

function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = tasks.map((task, index) => 
        `<li onclick="completeTask(${index})">${task}</li>`
    ).join("");
}

function completeTask(index) {
    tasks.splice(index, 1);
    xp += 20;

    if (xp >= 100) {
        level++;
        xp = 0;
        showAchievement();
    }
    updateStats();
    renderTasks();
}

function updateStats() {
    document.getElementById("level").textContent = level;
    document.getElementById("xpBar").value = xp;
}

function showAchievement() {
    const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
    document.getElementById("achievementText").textContent = `Достижение: ${randomAchievement}`;
}