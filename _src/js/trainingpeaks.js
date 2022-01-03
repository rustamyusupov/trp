const MyLibraryName = 'My Library';

const request = (url, options) =>
  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
    .then((response) => response?.json())
    .then(chrome.runtime.sendMessage);

const script = ({ url, tabId, options = {} }) =>
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

export const fetchLibId = async ({ url, tabId }) => {
  const result = await script({ url, tabId });
  const library = result.find(
    ({ libraryName }) => libraryName === MyLibraryName
  );

  return library?.exerciseLibraryId;
};

export const uploadWorkout = async ({ url, tabId, workout }) => {
  const options = { method: 'POST', body: JSON.stringify(workout) };
  const result = await script({ url, tabId, options });

  return result;
};
