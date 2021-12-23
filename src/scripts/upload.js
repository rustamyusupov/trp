export const upload = (url, workout) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(workout),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response?.json())
    .then(chrome.runtime.sendMessage);
