import { apis } from '../config.js';

import { storage } from './storage.js';
import { download } from './download.js';
import { upload } from './upload.js';
import { getActiveTab } from './utils.js';

const libId = '1752460';

const render = (content) => {
  const list = document.getElementById('message');

  list.innerHTML = content;
};

const init = async () => {
  const tab = await getActiveTab();
  const pageUrl = tab?.url;
  const isWorkoutsPage = pageUrl.includes(apis.tr.workouts);
  const isCalendarPage = pageUrl.includes(apis.tp.calendar);
  const isTargetPage = isWorkoutsPage || isCalendarPage;

  if (!isTargetPage) {
    render('Please open TR&nbsp;workout or TP&nbsp;calendar.');
    return;
  }

  const { workout } = await storage.get('workout');
  const workoutId = pageUrl.split('/').pop().split('-')[0];
  const isSaved = workoutId === String(workout?.workoutId);

  if (isWorkoutsPage && !isSaved) {
    const downloadUrl = `${apis.tr.workoutDetails}/${workoutId}`;

    render('Saving...');

    const workout = await download(downloadUrl, libId);

    storage.set({ workout });
    render(`Workout ${workout.itemName} saved.`);
    return;
  }

  const hasNoWorkout = isCalendarPage && !workout.itemName;

  if (hasNoWorkout) {
    render('No saved workout.<br />Please open TR&nbsp;workout.');
    return;
  }

  if (isCalendarPage) {
    const uploadUrl = `${apis.tp.libraries}/${libId}/items`;

    render('Uploading...');

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: upload,
        args: [uploadUrl, workout],
      },
      () => {
        new Promise((resolve) => {
          chrome.runtime.onMessage.addListener(function listener(result) {
            chrome.runtime.onMessage.removeListener(listener);
            resolve(result);
          });
        }).then((result) =>
          render(
            result?.itemName
              ? `Workout ${workout.itemName} uploaded.`
              : `Something wrong: ${result?.message?.toLowerCase()}`
          )
        );
      }
    );

    return;
  }

  // TODO move to isWorkoutsPage
  render(`Already saved ${workout.itemName}.`);
};

init();
