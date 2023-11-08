const request = (url, options) =>
  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then(response => console.log('fetch') || response?.json());

export default ({ url, tabId, options = {} }) =>
  new Promise((resolve, reject) => {
    chrome.scripting
      .executeScript({
        target: { tabId },
        func: request,
        args: [url, options],
      })
      .then(result => {
        if (!result) {
          reject(new Error('No result'));
          return;
        }

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result);
      });
  });
