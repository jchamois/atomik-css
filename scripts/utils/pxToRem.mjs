export const pxToRem =  (val) => {
  const baseFontSize = 16;
  if (typeof val === "string" && val.trim().endsWith("px")) {
    return `${parseFloat(val) / baseFontSize}rem`;
  }
  return typeof val === "number" ? `${val / baseFontSize}rem` : val;
};
