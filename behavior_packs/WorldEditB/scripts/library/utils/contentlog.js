import e from"config.js";function n(){return`[${new Date().toLocaleTimeString()}]`}class r{verbose(...o){console.log("[VERBOSE]",n(),...o)}log(...o){console.log("[LOG]",n(),...o)}warn(...o){console.warn("[WARN]",n(),...o)}error(...o){console.error("[ERROR]",n(),...o),o[0]?.stack&&console.error(o[0].stack)}debug(...o){e.debug&&console.log("[DEBUG]",n(),...o)}stack(){return new Error().stack.split(`
`).splice(1).join(`
`)}}const a=new r;export{a as contentLog};
