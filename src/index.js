import { pages, messageElement } from './constants.js';
import { api } from './api.js';
import { fetchWorkout } from './trainerroad.js';
import { convert, storage } from './utils/index.js';
import { fetchLibId, uploadWorkout } from './trainingpeaks.js';
import { delay } from './utils/index.js';

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
  const { tabs, i18n } = chrome;
  const tab = await getActiveTab();
  const { host } = new URL(tab?.url);
  const { libId } = await storage.get('libId');

  try {
    if (host === pages.trainerroad) {
      const isWorkout = tab?.url.includes(`${api.trainerroad.workouts}/`);

      if (!isWorkout) {
        render(i18n.getMessage('unknownTR'));
        return;
      }

      render(i18n.getMessage('downloading'));
      const { Workout } = await fetchWorkout(tab?.url);
      storage.set({ workout: Workout });
      render(i18n.getMessage('downloaded', Workout.Details.WorkoutName));

      return;
    }

    if (host === pages.trainingpeaks) {
      if (!libId) {
        render(i18n.getMessage('library'));
        const libId = await fetchLibId(tab?.id);
        storage.set({ libId });
      }

      const isCalendar = tab?.url.includes(api.trainingpeaks.calendar);

      if (!isCalendar) {
        render(i18n.getMessage('unknownTP'));
        return;
      }

      render(i18n.getMessage('uploading'));
      const data = await storage.get('workout');
      const workout = convert({
        libId,
        url: api.trainerroad.workouts,
        data: data.workout,
      });
      await uploadWorkout({ libId, tabId: tab?.id, workout });
      render(i18n.getMessage('uploaded', workout.itemName));
      await delay(1);
      tabs.reload(tab?.id);

      return;
    }
  } catch (error) {
    render(error);
    return;
  }

  render(i18n.getMessage('unknown'));
};

app();
