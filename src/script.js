const urls = {
  workouts: 'trainerroad.com/app/cycling/workouts',
  calendar: 'trainingpeaks.com/#calendar',
};

const hints = {
  tp: 'No saved workout.<br />Please open TR&nbsp;workout.',
  other: 'Please open TR&nbsp;workout or TP&nbsp;calendar.',
};

const getUrl = async () => {
  const option = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(option);

  return tab?.url;
};

const render = (content) => {
  const list = document.getElementById('message');

  list.innerHTML = content;
};

const init = async () => {
  const pageUrl = await getUrl();
  const isWorkoutPage = pageUrl.includes(urls.workouts);
  const isCalendarPage = pageUrl.includes(urls.calendar);
  const isTargetPage = isWorkoutPage || isCalendarPage;

  if (!isTargetPage) {
    render(hints.other);
    return;
  }

  const workout = { name: 'Tray Mountain -2' }; // get saved workout
  const hasNoWorkout = isCalendarPage && !workout.name;

  if (hasNoWorkout) {
    render(hints.tp);
    return;
  }

  render(workout.name);
};

init();
