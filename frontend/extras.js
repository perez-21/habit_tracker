function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

function capitalize(str) {
  if (!str) return ""; // Handle empty or undefined input
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
