import { api } from '../api.js';

const upload = (url, workout) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(workout),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response?.json())
    .then(chrome.runtime.sendMessage);

export const uploadWorkout = ({ libId, tabId, workout }) => {
  const url = `${api.trainingpeaks.libraries}/${libId}/items`;

  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        function: upload,
        args: [url, workout],
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
};
