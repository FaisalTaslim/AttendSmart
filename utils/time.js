function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const fullweek = (date = new Date()) => {
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const fullTime = (date = new Date()) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return { now: date, hours, minutes };
};

function timeToMinutes(h, m) {
  return h * 60 + m;
}

function formatTime(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

module.exports = {
  getMonthKey,
  fullweek,
  fullTime,
  timeToMinutes,
  formatTime,
};