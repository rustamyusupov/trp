const millisecondsInSecond = 1000;

export default (sec) =>
  new Promise((resolve) => setTimeout(resolve, sec * millisecondsInSecond));
