const urls = {
  workouts: 'trainerroad.com/app/cycling/workouts',
  calendar: 'trainingpeaks.com/#calendar',
};

const hints = {
  tp: 'No saved workouts.<br />Please open TR&nbsp;workout.',
  other: 'Please open TR&nbsp;workout or TP&nbsp;calendar.',
};

const getUrl = async () => {
  const option = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(option);

  return tab?.url;
};

const textRender = (content) => {
  const list = document.getElementById('list');

  list.innerHTML = content;
};

const listRender = (content) => {
  const list = document.getElementById('list');

  list.innerHTML = content;
};

const formatters = {
  text: textRender,
  list: listRender,
};

const render = (data) =>
  formatters[Array.isArray(data) ? 'list' : 'text'](data);

const init = async () => {
  const pageUrl = await getUrl();
  const isWorkoutsPage = pageUrl.includes(urls.workouts);
  const isCalendarPage = pageUrl.includes(urls.calendar);
  const isTargetPage = isWorkoutsPage || isCalendarPage;

  if (!isTargetPage) {
    render(hints.other);
    return;
  }

  const workouts = []; // get saved workouts
  const hasNoWorkoutsForCalendar = isCalendarPage && workouts.length === 0;

  if (hasNoWorkoutsForCalendar) {
    render(hints.tp);
    return;
  }

  render(workouts);
};

// think about split js

init();
