import { fetchLibId, uploadWorkout } from './js/trainingpeaks.js';
import { api } from './js/api.js';
import { convert } from './js/convert.js';
import { delay } from './js/delay.js';
import { fetchWorkout } from './js/trainerroad.js';
import { storage } from './js/storage.js';

const messageElement = 'message';
const pages = {
  trainerroad: 'www.trainerroad.com',
  trainingpeaks: 'app.trainingpeaks.com',
};

const getActiveTab = () =>
  chrome.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((tabs) => tabs?.[0]);

const getWorkoutId = (url) => url.split('/').pop().split('-')[0];

const getLibId = async ({ url, tabId }) => {
  const { libId } = await storage.get('libId');

  if (!libId) {
    const libId = await fetchLibId({ url, tabId });

    storage.set({ libId });
    return libId;
  }

  return libId;
};

const render = (content) =>
  (document.getElementById(messageElement).innerHTML = content);

const app = async () => {
  const { tabs, i18n } = chrome;
  const { url, id } = await getActiveTab();
  const { host } = new URL(url);

  try {
    if (host === pages.trainerroad) {
      const isWorkout = url.includes(`${api.trainerroad.workouts}/`);

      if (!isWorkout) {
        render(i18n.getMessage('unknownTR'));
        return;
      }

      render(i18n.getMessage('downloading'));
      const workoutId = getWorkoutId(url);
      const { Workout } = await fetchWorkout(
        `${api.trainerroad.workoutDetails}/${workoutId}`
      );
      storage.set({ workout: Workout });
      render(i18n.getMessage('downloaded', Workout.Details.WorkoutName));

      return;
    }

    if (host === pages.trainingpeaks) {
      const isCalendar = url.includes(api.trainingpeaks.calendar);

      if (!isCalendar) {
        render(i18n.getMessage('unknownTP'));
        return;
      }

      render(i18n.getMessage('fetching'));
      const libId = await getLibId({
        url: api.trainingpeaks.libraries,
        tabId: id,
      });

      render(i18n.getMessage('uploading'));
      const data = await storage.get('workout');

      if (!data?.workout) {
        render(i18n.getMessage('workout'));
        return;
      }

      const workout = convert({
        libId,
        url: api.trainerroad.workouts,
        data: data.workout,
      });
      await uploadWorkout({
        url: `${api.trainingpeaks.libraries}/${libId}/items`,
        tabId: id,
        workout,
      });
      render(i18n.getMessage('uploaded', workout.itemName));
      await delay(1);
      tabs.reload(id);

      return;
    }
  } catch (error) {
    render(error);
    return;
  }

  render(i18n.getMessage('unknown'));
};

app();
