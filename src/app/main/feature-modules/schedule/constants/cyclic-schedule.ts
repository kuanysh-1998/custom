import { ScheduleDay } from '../models/schedule-models';
import { getDayOff, getScheduleDay } from './schedule-day';

export function getInitialCyclicSchedule(): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  days.push(getScheduleDay(1));
  days.push(getScheduleDay(2));
  days.push(getDayOff(3));
  days.push(getDayOff(4));

  return days;
}

export function generateCyclicSchedule(daysNumber: number) {
  const days: ScheduleDay[] = [];

  for (let dayNumber = 1; dayNumber <= daysNumber; dayNumber++) {
    days.push(getScheduleDay(dayNumber));
  }

  return days;
}
