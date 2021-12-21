const trUrl = '/cycling/workouts';

const getUrl = async () => {
  const option = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(option);

  return tab?.url;
};

const init = async () => {
  const url = await getUrl();
  const isTr = url.includes(trUrl);
  const list = document.getElementById('list');

  if (!isTr) {
    list.innerHTML = 'Open TR workout';
    return;
  }
};

init();
