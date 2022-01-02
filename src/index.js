import { libId, pages, messageElement } from './constants.js';
import { api } from './api.js';
import { fetchWorkout } from './trainerroad.js';
import { convert, storage } from './utils/index.js';
import { uploadWorkout } from './trainingpeaks.js';
import { locale } from './locale.js';

const getActiveTab = () =>
  chrome.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((tabs) => tabs?.[0]);

const render = (content) =>
  (document.getElementById(messageElement).innerHTML = content);

const app = async () => {
  const tab = await getActiveTab();
  const { host } = new URL(tab?.url);

  if (host === pages.trainerroad) {
    render(locale.downloading);

    try {
      const data = await fetchWorkout(tab?.url);
      const workout = convert({
        libId,
        url: api.trainerroad.workouts,
        data,
      });

      storage.set({ workout });
      render(locale.downloaded);
    } catch (error) {
      render(error);
    }

    return;
  }

  if (host === pages.trainingpeaks) {
    render(locale.uploading);

    try {
      const { workout } = await storage.get('workout');

      await uploadWorkout({ libId, tabId: tab?.id, workout });

      render(locale.uploaded);
    } catch (error) {
      render(error);
    }

    return;
  }

  render(locale.unknown);
};

app();
