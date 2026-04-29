// utils.js
function safeParse(json) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

function formatNumber(num) {
  return num.toLocaleString('ru-RU');
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
