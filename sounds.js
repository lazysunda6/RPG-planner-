// sound.js
const sounds = {
  achievement: new Audio('sounds/achievement.mp3'),
  attack: new Audio('sounds/attack.mp3'),
  levelUp: new Audio('sounds/level-up.mp3')
};

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0; // Перемотка на начало
    sounds[type].play().catch(() => console.log(`Ошибка воспроизведения звука: ${type}`));
  }
}
