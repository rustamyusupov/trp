const request = (url, options) =>
  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
    .then((response) => response?.json())
    .then(chrome.runtime.sendMessage);

export default ({ url, tabId, options = {} }) =>
  new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        function: request,
        args: [url, options],
      },
      new Promise((res) => {
        chrome.runtime.onMessage.addListener(function listener(result) {
          chrome.runtime.onMessage.removeListener(listener);

          if (result?.message) {
            reject(result.message);
          }

          resolve(result);
          res();
        });
      })
    );
  });
