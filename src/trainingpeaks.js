import { api } from '../api.js';

const request = (url, options) =>
  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
    .then((response) => response?.json())
    .then(chrome.runtime.sendMessage);

const script = ({ tabId, url, options = {} }) =>
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

export const fetchLibId = async (tabId) => {
  const result = await script({ tabId, url: api.trainingpeaks.libraries });
  const library = result.find(
    ({ libraryName }) => libraryName === 'My Library'
  );

  return library?.exerciseLibraryId;
};

export const uploadWorkout = async ({ libId, tabId, workout }) => {
  const url = `${api.trainingpeaks.libraries}/${libId}/items`;
  const options = { method: 'POST', body: JSON.stringify(workout) };
  const result = await script({ tabId, url, options });

  return result;
};
