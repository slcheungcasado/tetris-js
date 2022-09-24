// word = 'apple'
// return {
//   starters: ['a', 'ap', 'app', 'appl'],
//   enders: ['e', 'le', 'ple', 'pple'],
//   middlers: ['p', 'p', 'l', 'pp', 'pl', 'ppl']
// }
//
function getWordParts(word) {
  const starters = [];
  const enders = [];
  const middlers = [];

  word
    .slice(0, word.length - 1)
    .split("")
    .forEach((letter, index) => {
      starters.push(word.slice(0, index + 1));
    });

  word
    .slice(1)
    .split("")
    .forEach((letter, index) => {
      enders.push(word.slice(index + 1));
    });

  word
    .slice(1, word.length - 1)
    .split("")
    .forEach((letter, start, arr) => {
      for (let end = start; end < arr.length; end += 1) {
        middlers.push(arr.slice(start, end + 1).join(""));
      }
      // middlers.push(letter);
      // if (index < arr.length - 1) middlers.push(letter + arr[index + 1]);
      // if (index < arr.length - 2)
      //   middlers.push(letter + arr[index + 1] + arr[index + 2]);
    });

  return {
    starters,
    enders,
    middlers,
  };
}

const obj = getWordParts("apple");
console.log(obj);
