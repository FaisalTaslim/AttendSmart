function parseSubjects(value) {
  if (!value) return [];

  return value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

const VALID_DAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const DAY_KEY_BY_LOWER = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function isValidTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

module.exports = {
  parseSubjects,
  VALID_DAYS,
  DAY_KEY_BY_LOWER,
  isValidTime,
};