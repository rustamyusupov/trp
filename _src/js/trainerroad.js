export const fetchWorkout = async (url) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return response.json();
};
