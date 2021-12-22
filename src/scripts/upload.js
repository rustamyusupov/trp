export const upload = (libId, workout) => {
  const tpAPI = 'https://tpapi.trainingpeaks.com/exerciselibrary/v1/libraries';
  const tpUrl = `${tpAPI}/${libId}/items`;

  const data = JSON.stringify(workout);

  fetch(tpUrl, {
    method: 'POST',
    body: data,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response?.json())
    .then((data) => chrome.runtime.sendMessage(data))
    .catch((e) => console.log(e) || chrome.runtime.sendMessage(e));
};
