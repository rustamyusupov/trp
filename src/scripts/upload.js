export const upload = (url, workout) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(workout),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response?.json())
    .then((data) => chrome.runtime.sendMessage(data))
    // catch error when incorrect libId
    .catch((e) => console.log(e) || chrome.runtime.sendMessage(e));
