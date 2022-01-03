import api from '../utils/api.js';
import i18n from '../utils/i18n.js';
import render from '../utils/render.js';
import storage from '../utils/storage.js';

const getWorkoutId = (url) => url.split('/').pop().split('-')[0];

const fetchWorkout = async (url) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return response.json();
};

export default async (url) => {
  const isWorkout = url.includes(`${api.trainerroad.workouts}/`);

  if (!isWorkout) {
    render(i18n('notWorkoutPage'));
    return;
  }

  render(i18n('downloading'));

  const workoutId = getWorkoutId(url);

  try {
    const { Workout } = await fetchWorkout(
      `${api.trainerroad.workoutDetails}/${workoutId}`
    );

    storage.set({ workout: Workout });
    render(i18n('downloaded', Workout.Details.WorkoutName));
  } catch (error) {
    render(error);
  }
};
