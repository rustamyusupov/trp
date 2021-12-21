const urls = {
  trWorkouts: 'trainerroad.com/app/cycling/workouts',
  tpCalendar: 'trainingpeaks.com/#calendar',
};

const hints = {
  tp: 'No saved workouts.<br />Please open TR&nbsp;workout.',
  other: 'Please open TR&nbsp;workout or TP&nbsp;calendar.',
};

const getUrl = async () => {
  const option = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(option);

  return tab?.urls;
};

const textRender = (content) => {
  const list = document.getElementById('list');

  list.innerHTML = content;
};

const listRender = (content) => {
  const list = document.getElementById('list');

  list.innerHTML = 'Workouts';
};

const formatters = {
  text: textRender,
  list: listRender,
};

const render = (data, format) => formatters[format](data);

const init = async () => {
  const pageUrl = await getUrl();
  const isWorkouts = pageUrl.includes(urls.trWorkouts);
  const isCalendar = pageUrl.includes(urls.tpCalendar);
  const isTargetPage = isWorkouts || isCalendar;

  if (!isTargetPage) {
    render(hints.other, 'text');
    return;
  }

  // get saved workouts
  const workouts = [];
  const hasWorkoutsForTp = isCalendar && workouts.length === 0;

  if (!hasWorkoutsForTp) {
    render(hints.tp, 'text');
    return;
  }

  render(workouts, 'list');
};

init();
