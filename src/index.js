import flows from './flows/index.js';

const getActiveTab = () =>
  chrome.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((tabs) => tabs?.[0]);

const app = async () => {
  const { url, id } = await getActiveTab();

  flows(url, id);
};

app();
