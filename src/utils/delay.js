const millisecondsInSecond = 1000;

export const delay = (sec) =>
  new Promise((resolve) => setTimeout(resolve, sec * millisecondsInSecond));
