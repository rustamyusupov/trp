import { pages, messageElement } from './constants.js';
import { api } from './api.js';
import { fetchWorkout } from './trainerroad.js';
import { convert, storage } from './utils/index.js';
import { fetchLibId, uploadWorkout } from './trainingpeaks.js';
import { delay } from './utils/index.js';

const { getMessage } = chrome.i18n;

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
        render(getMessage('libraryWarning'));
        return;
      }

      const isWorkout = tab?.url.includes(`${api.trainerroad.workouts}/`);
      if (!isWorkout) {
        render(getMessage('unknownTR'));
        return;
      }

      render(getMessage('downloading'));
      const data = await fetchWorkout(tab?.url);
      const workout = convert({
        libId,
        url: api.trainerroad.workouts,
        data,
      });
      storage.set({ workout });
      render(getMessage('downloaded', workout.itemName));

      return;
    }

    if (host === pages.trainingpeaks) {
      if (!libId) {
        render(getMessage('libraryFetching'));
        const libId = await fetchLibId(tab?.id);
        storage.set({ libId });
      }

      const isCalendar = tab?.url.includes(api.trainingpeaks.calendar);
      if (!isCalendar) {
        render(getMessage('unknownTP'));
        return;
      }

      render(getMessage('uploading'));
      const { workout } = await storage.get('workout');
      await uploadWorkout({ libId, tabId: tab?.id, workout });
      render(getMessage('uploaded', workout.itemName));
      await delay(1);
      chrome.tabs.reload(tab?.id);

      return;
    }
  } catch (error) {
    render(error);
    return;
  }

  render(getMessage('unknown'));
};

app();
