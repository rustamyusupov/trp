const get = (name) =>
  new Promise((resolve) =>
    chrome.storage.local.get(name, (response) => resolve(response))
  );

const set = (data) => chrome.storage.local.set(data);

export default { get, set };
