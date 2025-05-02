// script.js
const game = (() => {
  const config = {
    xpPerTask: 15,
    baseXPRequired: 100,
    xpGrowthFactor: 1.15,
    bossDamageMin: 10,
    bossDamageMax: 20
  };

  const state = {
    tasks: [],
    xp: 0,
    level: 1,
    currentBoss: 0,
    bossHp: gameData.bosses[0].maxHp,
    defeatedBosses: new Set(),
    items: gameData.items,
    achievements: gameData.achievements,
    earnedAchievements: new Set()
  };

  function init() {
    loadData();
    bindEvents();
    renderAll();
  }

  function loadData() {
    const saved = safeParse(localStorage.getItem('gameState'));
    if (saved) {
      state.tasks = Array.isArray(saved.tasks) ? saved.tasks : state.tasks;
      state.xp = typeof saved.xp === 'number' ? saved.xp : state.xp;
      state.level = typeof saved.level === 'number' ? saved.level : state.level;
      state.currentBoss = typeof saved.currentBoss === 'number' ? saved.currentBoss : state.currentBoss;
      state.bossHp = typeof saved.bossHp === 'number' ? saved.bossHp : state.bossHp;
      state.items = Array.isArray(saved.items) ? saved.items : state.items;
      state.earnedAchievements = new Set(saved.earnedAchievements || []);
      state.defeatedBosses = new Set(saved.defeatedBosses || []);
    }
  }

  function saveData() {
    localStorage.setItem('gameState', JSON.stringify({
      tasks: state.tasks,
      xp: state.xp,
      level: state.level,
      currentBoss: state.currentBoss,
      bossHp: state.bossHp,
      items: state.items,
      earnedAchievements: Array.from(state.earnedAchievements),
      defeatedBosses: Array.from(state.defeatedBosses)
    }));
  }

  function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return alert('Введите текст квеста!');
    state.tasks.push({ text, done: false });
    input.value = '';
    input.focus();
    updateGame();
  }

  function toggleTask(index) {
    const task = state.tasks[index];
    task.done = !task.done;
    if (task.done) {
      state.xp += config.xpPerTask;
      checkLevelUp();
    }
    updateGame();
  }

  function checkLevelUp() {
    const required = getRequiredXP();
    while (state.xp >= required) {
      state.xp -= required;
      state.level++;
      // playSound('levelUp');
      checkAchievements();
    }
  }

  function getRequiredXP() {
    return Math.floor(config.baseXPRequired * Math.pow(config.xpGrowthFactor, state.level - 1));
  }

  function attackBoss() {
    if (state.bossHp <= 0) return alert('Босс уже побеждён!');
    let damage = config.bossDamageMin + Math.floor(Math.random() * (config.bossDamageMax - config.bossDamageMin + 1));
    const strengthScroll = state.items.find(item => item.name === "Свиток силы" && !item.used);
    if (strengthScroll) {
      damage += strengthScroll.damageBonus;
    }
    state.bossHp = clamp(state.bossHp - damage, 0, gameData.bosses[state.currentBoss].maxHp);
    // playSound('attack');
    if (state.bossHp <= 0) {
      state.defeatedBosses.add(state.currentBoss);
      state.xp += gameData.bosses[state.currentBoss].xpReward;
      checkLevelUp();
      alert(`Босс "${gameData.bosses[state.currentBoss].name}" повержен! Получено ${gameData.bosses[state.currentBoss].xpReward} XP!`);
      switchToNextBoss();
    }
    updateGame();
  }

  function switchToNextBoss() {
    state.currentBoss = (state.currentBoss + 1) % gameData.bosses.length;
    state.bossHp = gameData.bosses[state.currentBoss].maxHp;
  }

  function resetBoss() {
    state.bossHp = gameData.bosses[state.currentBoss].maxHp;
    document.querySelector('#attackBossBtn').disabled = false;
    updateGame();
  }

  function useItem(index) {
    const item = state.items[index];
    if (item.used) return;
    item.used = true;
    if (item.xp) state.xp += item.xp;
    checkLevelUp();
    updateGame();
  }

  function resetGame() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
      localStorage.removeItem('gameState');
      Object.assign(state, {
        tasks: [],
        xp: 0,
        level: 1,
        currentBoss: 0,
        bossHp: gameData.bosses[0].maxHp,
        defeatedBosses: new Set(),
        items: gameData.items.map(item => ({ ...item, used: false })),
        earnedAchievements: new Set()
      });
      updateGame();
    }
  }

  function checkAchievements() {
    state.achievements.forEach(ach => {
      if (!state.earnedAchievements.has(ach.id) && ach.condition(state)) {
        state.earnedAchievements.add(ach.id);
        showAchievement(ach.text);
      }
    });
  }

  function renderAll() {
    renderTasks();
    renderStats();
    renderBoss();
    renderInventory();
    renderQuests();
  }

  function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = state.tasks.map((task, i) => `
      <li>
        <span class="${task.done ? 'task-complete' : ''}">${task.text}</span>
        <button class="taskBtn" data-index="${i}">${task.done ? '✓' : 'Сделать'}</button>
        <button class="deleteBtn" data-index="${i}">Удалить</button>
      </li>
    `).join('');
  }

  function renderStats() {
    document.getElementById('level').textContent = `Уровень: ${state.level}`;
    document.getElementById('xpBar').value = state.xp;
    document.getElementById('xpBar').max = getRequiredXP();
    document.getElementById('xpValue').textContent = state.xp;
    document.getElementById('requiredXP').textContent = getRequiredXP();
  }

  function renderBoss() {
    const boss = gameData.bosses[state.currentBoss];
    document.querySelector('#boss h2').textContent = `Босс: ${boss.name}`;
    document.getElementById('bossDescription').textContent = boss.description;
    document.getElementById('bossHp').textContent = state.bossHp;
    document.getElementById('bossMaxHp').textContent = boss.maxHp;
    document.getElementById('bossProgress').value = state.bossHp;
    document.getElementById('bossProgress').max = boss.maxHp;
    document.querySelector('#attackBossBtn').disabled = state.bossHp <= 0;
    document.querySelector('#resetBossBtn').style.display = state.bossHp <= 0 ? 'block' : 'none';
  }

  function renderInventory() {
    const html = state.items.map((item, i) => `
      <div class="item" role="button" tabindex="0" onclick="game.useItem(${i})" ${item.used ? 'aria-disabled="true" style="opacity:0.5"' : ''}>
        ${item.name}${item.used ? ' (использован)' : ''}
      </div>
    `).join('') || 'пусто';
    document.getElementById('inventory').innerHTML = `<h2>Инвентарь</h2>${html}`;
  }

  function renderQuests() {
    const active = state.tasks.filter(t => !t.done);
    const html = active.length ?
      active.map(t => `<div>${t.text}</div>`).join('') : 'нет активных';
    document.getElementById('quests').innerHTML = `<h2>Квесты</h2>${html}`;
  }

  function showAchievement(text) {
    const el = document.getElementById('achievementText');
    el.textContent = `Достижение: ${text}`;
    el.classList.add('achievement-unlock');
    // playSound('achievement');
    setTimeout(() => el.classList.remove('achievement-unlock'), 3000);
  }

  function bindEvents() {
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') addTask();
    });
    document.querySelector('#attackBossBtn').addEventListener('click', attackBoss);
    document.querySelector('#resetBossBtn').addEventListener('click', resetBoss);
    document.querySelector('#resetGameBtn').addEventListener('click', resetGame);

    document.getElementById('taskList').addEventListener('click', e => {
      const index = e.target.dataset.index;
      if (e.target.classList.contains('taskBtn')) {
        toggleTask(index);
      } else if (e.target.classList.contains('deleteBtn')) {
        game.deleteTask(index);
      }
    });
  }

  function updateGame() {
    checkAchievements();
    renderAll();
    saveData();
  }

  return {
    init,
    addTask,
    toggleTask,
    deleteTask: index => {
      state.tasks.splice(index, 1);
      updateGame();
    },
    attackBoss,
    useItem,
    updateGame
  };
})();

window.onload = game.init;