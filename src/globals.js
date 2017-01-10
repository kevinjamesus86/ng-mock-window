import globals from 'globals';

let uniq = {};

// merge
[
  globals.builtin,
  globals.es6,
  globals.browser
].forEach(function(globalsMap) {
  for (let property in globalsMap) {
    uniq[property] = 1;
  }
});

uniq = Object.keys(uniq);
export default uniq;
