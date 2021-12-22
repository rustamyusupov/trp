const getTpWorkout = (libId, data) => {
  const intervalData = data.Workout.intervalData;
  const structure = [];
  let end = 0;
  let testInterval = false;

  for (let i = 1; i < intervalData.length; i++) {
    if (intervalData[i].TestInterval) {
      testInterval = intervalData[i];
      break;
    }
  }

  for (let i = 1; i < intervalData.length; i++) {
    if (testInterval && testInterval.Name !== intervalData[i].Name) {
      if (
        intervalData[i].Start >= testInterval.Start &&
        intervalData[i].End <= testInterval.End
      ) {
        continue;
      }
    }

    let ic = 'warmUp';
    if (i == 1) {
      ic = 'warmUp';
    } else if (i === intervalData.length) {
      ic = 'coolDown';
    } else if (intervalData[i].StartTargetPowerPercent > 60) {
      ic = 'active';
    } else {
      ic = 'rest';
    }

    if (intervalData[i].Name === 'Fake' && i === 1) {
      intervalData[i].Name = 'Warm up';
    } else if (intervalData[i].Name === 'Fake') {
      intervalData[i].Name = 'Recovery';
    }

    end = intervalData[i].End;

    structure.push({
      type: 'step',
      length: { value: 1, unit: 'repetition' },
      steps: [
        {
          name: intervalData[i].Name,
          length: {
            value: intervalData[i].End - intervalData[i].Start,
            unit: 'second',
          },
          targets: [{ minValue: intervalData[i].StartTargetPowerPercent }],
          intensityClass: ic,
        },
      ],
      begin: intervalData[i].Start,
      end: intervalData[i].End,
    });
  }

  const duration = parseInt(data.Workout.Details.Duration) / 60;
  let description = data.Workout.Details.WorkoutDescription;

  description +=
    '\n\nhttps://www.trainerroad.com/cycling/workouts/' +
    data.Workout.Details.Id;

  const polyline = [];
  let lastPercent = 0;

  for (let i = 1; i < intervalData.length; i++) {
    polyline.push([parseFloat(intervalData[i].Start / end), 0]);
    polyline.push([
      parseFloat(intervalData[i].Start / end),
      intervalData[i].StartTargetPowerPercent / 100,
    ]);
    polyline.push([
      parseFloat(intervalData[i].End / end),
      intervalData[i].StartTargetPowerPercent / 100,
    ]);
    lastPercent = intervalData[i].StartTargetPowerPercent / 100;
  }

  polyline.push([1, 0]);

  const workout = {
    exerciseLibraryId: libId,
    exerciseLibraryItemId: '',
    itemName: data.Workout.Details.WorkoutName.replace(/\s+/g, ''),
    itemType: 2,
    workoutTypeId: 2,
    workoutType: '',
    distancePlanned: '',
    totalTimePlanned: duration,
    caloriesPlanned: parseInt(data.Workout.Details.Kj) * 0.239006,
    tssPlanned: data.Workout.Details.TSS,
    ifPlanned: parseInt(data.Workout.Details.IntensityFactor) / 100,
    velocityPlanned: '',
    energyPlanned: '',
    elevationGainPlanned: '',
    description: description,
    coachComments: '',
    exerciseLibraryItemFilters: '',
    code: '',
    structure: JSON.stringify({
      structure: structure,
      polyline: polyline,
      primaryLengthMetric: 'duration',
      primaryIntensityMetric: 'percentOfFtp',
    }),
    fileAttachments: '',
    fromLegacy: false,
    iExerciseLibraryItemValue: '',
    exercises: '',
    attachmentFileInfos: '',
    isStructuredWorkout: '',
    libraryOwnerId: '',
  };

  return workout;
};

export const download = async (libId, pageUrl) => {
  const workoutId = pageUrl.split('/').pop().split('-')[0];
  const trAPI = 'https://www.trainerroad.com/app/api/workoutdetails';
  const trUrl = `${trAPI}/${workoutId}`;

  const response = await fetch(trUrl, { credentials: 'include' });
  const data = await response.json();
  const workout = getTpWorkout(libId, data);

  return workout;
};
