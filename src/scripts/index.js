import { apis } from '../config.js';
import { download } from './download.js';
import { upload } from './upload.js';

const getUrl = async () => {
  const option = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(option);

  return tab?.url;
};

const render = (content) => {
  const list = document.getElementById('message');

  list.innerHTML = content;
};

const save = (data) => chrome.storage.local.set(data);

const load = (name) =>
  new Promise((resolve) => {
    chrome.storage.local.get(name, (response) => resolve(response));
  });

const libId = '123';

const init = async () => {
  const pageUrl = await getUrl();
  const isWorkoutsPage = pageUrl.includes(apis.tr.workouts);
  const isCalendarPage = pageUrl.includes(apis.tp.calendar);
  const isTargetPage = isWorkoutsPage || isCalendarPage;

  if (!isTargetPage) {
    render('Please open TR&nbsp;workout or TP&nbsp;calendar.');
    return;
  }

  const { workout } = await load('workout');
  const isSaved = pageUrl.includes(workout?.itemName.toLowerCase());

  if (isWorkoutsPage && !isSaved) {
    render('Saving...');

    const workout = await download(libId, pageUrl);

    save({ workout });
    render(`Workout ${workout.itemName} saved.`);
    return;
  }

  const hasNoWorkout = isCalendarPage && !workout.itemName;

  if (hasNoWorkout) {
    render('No saved workout.<br />Please open TR&nbsp;workout.');
    return;
  }

  if (isCalendarPage) {
    render('Uploading...');

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const uploadUrl = `${apis.tp.libraries}/${libId}/items`;

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
        }).then((result) => {
          console.log(result);

          if (result?.itemName) {
            render(`Workout ${workout.itemName} uploaded.`);
            return;
          }

          render(`Something wrong: ${result?.message?.toLowerCase()}`);
        });
      }
    );

    return;
  }

  render(`Already saved ${workout.itemName}.`);
};

init();
