
import { classMatrix } from "./classMatrix.mjs";
import { pxToRem } from "./pxToRem.mjs";

export const classGenerator = (config) => {
  let baseCSS = "";
  const respBlocks = Object.fromEntries(
    Object.keys(config.breakpoints || {}).map((bp) => [bp, ""])
  );

  for (const [section, gen] of Object.entries(classMatrix)) {
    const vals = config[section];
    if (!vals) continue;

    if (Array.isArray(vals)) {
      vals.forEach((v) => {
        const rules = gen(null, v);
        baseCSS += rules.join("\n") + "\n";
        Object.keys(respBlocks).forEach((bp) => {
          respBlocks[bp] +=
            rules.map((r) => r.replace(" {", `\\@\\<${bp} {`)).join("\n") +
            "\n";
        });
      });
    } else {
      Object.entries(vals).forEach(([key, val]) => {
        const valList = Array.isArray(val) ? val : [val];
        valList.forEach((v) => {
          const rules = gen(key, v, key);
          baseCSS += rules.join("\n") + "\n";
          Object.keys(respBlocks).forEach((bp) => {
            respBlocks[bp] +=
              rules.map((r) => r.replace(" {", `\\@\\<${bp} {`)).join("\n") +
              "\n";
          });
        });
      });
    }
  }

  const respCSS = Object.entries(respBlocks)
    .map(
      ([bp, rules]) =>
        `@media (max-width: ${pxToRem(config.breakpoints[bp])}) {\n` +
        rules
          .trim()
          .split("\n")
          .map((l) => "  " + l)
          .join("\n") +
        `\n}`
    )
    .join("\n\n");

  return { base: baseCSS.trim(), responsive: respCSS };
}