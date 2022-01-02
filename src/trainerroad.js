import { api } from './api.js';

const getWorkoutId = (url) => url.split('/').pop().split('-')[0];

export const fetchWorkout = async (url) => {
  const workoutId = getWorkoutId(url);
  const workoutUrl = `${api.trainerroad.workoutDetails}/${workoutId}`;

  const response = await fetch(workoutUrl, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return response.json();
};
