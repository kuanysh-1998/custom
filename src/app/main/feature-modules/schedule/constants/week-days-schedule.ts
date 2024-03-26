import { ScheduleDay } from '../models/schedule-models';
import {getDayOff, getScheduleDay} from './schedule-day';

export function getInitialWeekDaysSchedule(): ScheduleDay[] {
  const days: ScheduleDay[] = [];

  for (let i = 1; i <= 5; i++) {
    days.push(getScheduleDay(i));
  }

  days.push(getDayOff(6), getDayOff(7));
  return days;
}
