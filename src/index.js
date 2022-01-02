import { pages, messageElement } from './constants.js';
import { api } from './api.js';
import { fetchWorkout } from './trainerroad.js';
import { convert, storage } from './utils/index.js';
import { fetchLibId, uploadWorkout } from './trainingpeaks.js';
import { mainLocale, libraryLocale } from './locales/index.js';

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
  const { libId } = await storage.get('libId');

  try {
    if (host === pages.trainerroad) {
      if (!libId) {
        render(libraryLocale.warning);
        return;
      }

      render(mainLocale.downloading);
      const data = await fetchWorkout(tab?.url);
      const workout = convert({
        libId,
        url: api.trainerroad.workouts,
        data,
      });
      storage.set({ workout });
      render(mainLocale.downloaded);

      return;
    }

    if (host === pages.trainingpeaks) {
      if (!libId) {
        render(libraryLocale.fetching);
        const libId = await fetchLibId(tab?.id);
        storage.set({ libId });
      }

      render(mainLocale.uploading);
      const { workout } = await storage.get('workout');
      await uploadWorkout({ libId, tabId: tab?.id, workout });
      render(mainLocale.uploaded);

      return;
    }
  } catch (error) {
    render(error);
    return;
  }

  render(mainLocale.unknown);
};

app();
