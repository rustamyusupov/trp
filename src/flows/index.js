import trainerroad from './trainerroad.js';
import trainingpeaks from './trainingpeaks.js';
import other from './other.js';

const flows = {
  'www.trainerroad.com': trainerroad,
  'app.trainingpeaks.com': trainingpeaks,
  other,
};

export default (url, id) => {
  const { host } = new URL(url);

  flows?.[host] ? flows[host](url, id) : flows.other();
};
