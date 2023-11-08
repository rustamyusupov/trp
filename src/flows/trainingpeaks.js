import api from '../utils/api.js';
import convert from '../utils/convert.js';
import delay from '../utils/delay.js';
import i18n from '../utils/i18n.js';
import render from '../utils/render.js';
import script from '../utils/script.js';
import storage from '../utils/storage.js';

const MyLibraryName = 'My Library';

const fetchLibId = async ({ url, tabId }) => {
  const result = await script({ url, tabId });
  const library = result?.[0]?.result.find(({ libraryName }) => libraryName === MyLibraryName);

  return library?.exerciseLibraryId;
};

const getLibId = async ({ url, tabId }) => {
  const { libId } = await storage.get('libId');

  if (!libId) {
    const libId = await fetchLibId({ url, tabId });

    storage.set({ libId });
    return libId;
  }

  return libId;
};

const uploadWorkout = async ({ url, tabId, workout }) => {
  const options = { method: 'POST', body: JSON.stringify(workout) };
  const result = await script({ url, tabId, options });

  return result;
};

export default async (url, id) => {
  const isCalendar = url.includes(api.trainingpeaks.calendar);

  if (!isCalendar) {
    render(i18n('notCalendarPage'));
    return;
  }

  try {
    render(i18n('fetchingLibraryId'));
    const libId = await getLibId({
      url: api.trainingpeaks.libraries,
      tabId: id,
    });

    render(i18n('uploading'));
    const data = await storage.get('workout');

    if (!data?.workout) {
      render(i18n('noWorkout'));
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

    render(i18n('uploaded', workout.itemName));
  } catch (error) {
    render(error);
    return;
  }

  await delay(1);
  chrome.tabs.reload(id);
};
