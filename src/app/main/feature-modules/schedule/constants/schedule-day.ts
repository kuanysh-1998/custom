import { ScheduleDay } from '../models/schedule-models';

export function getScheduleDay(dayNumber: number): ScheduleDay {
  return {
    isOffday: false,
    dayNumber,
    workSpans: [
      {
        locationId: null,
        workTime: {
          start: {
            hour: 9,
            minute: 0,
          },
          end: {
            hour: 18,
            minute: 0,
          },
        },
        boundaryInTime: {
          start: {
            hour: 5,
            minute: 0,
          },
          end: {
            hour: 9,
            minute: 0,
          },
        },
        boundaryOutTime: {
          start: {
            hour: 9,
            minute: 0,
          },
          end: {
            hour: 5,
            minute: 0,
          },
        },
        breaks: [
          {
            time: {
              start: {
                hour: 13,
                minute: 0,
              },
              end: {
                hour: 14,
                minute: 0,
              },
            },
          },
        ],
      },
    ],
  };
}

export function getDayOff(dayNumber: number): ScheduleDay {
  return {
    isOffday: true,
    dayNumber,
    workSpans: [],
  };
}
