 export const hexToRgb = (input) =>  {
  if (typeof input !== "string") return input;

  let hex = input.trim().toLowerCase();
  if (!hex.startsWith("#")) return input;

  hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex.split("").map((ch) => ch + ch).join("");
  }
  if (hex.length !== 6) return input;

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `${r}, ${g}, ${b}`;
}