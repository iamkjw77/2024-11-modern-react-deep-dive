const date = new Date();

console.log(typeof JSON.parse(JSON.stringify(date)));
console.log(typeof structuredClone(date));
