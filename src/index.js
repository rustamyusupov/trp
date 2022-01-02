import { libId, pages, messageElement, messages } from './constants.js';
import { routes } from './routes.js';
import { fetchWorkout } from './trainerroad.js';
import { convert, storage } from './utils/index.js';
import { uploadWorkout } from './trainingpeaks.js';

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
    render(messages.downloading());

    try {
      const data = await fetchWorkout(tab?.url);
      const workout = convert({
        libId,
        url: routes.trainerroad.workouts,
        data,
      });

      storage.set({ workout });
      render(messages.downloaded(workout.itemName));
    } catch (error) {
      render(error);
    }

    return;
  }

  if (host === pages.trainingpeaks) {
    render(messages.uploading());

    try {
      const { workout } = await storage.get('workout');

      const result = await uploadWorkout({ libId, tabId: tab?.id, workout });

      render(messages.uploaded(result?.itemName));
    } catch (error) {
      console.log(error);
      render(error);
    }

    return;
  }

  render(messages.unknown());
};

app();
