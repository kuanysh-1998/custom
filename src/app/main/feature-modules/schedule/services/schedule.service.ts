import { Injectable } from '@angular/core';
import {
  ScheduleDay,
  ScheduleType,
  Time,
  TimeRange,
} from '../models/schedule-models';
import { BehaviorSubject } from 'rxjs';
import { getInitialWeekDaysSchedule } from '../constants/week-days-schedule';
import {
  generateCyclicSchedule,
  getInitialCyclicSchedule,
} from '../constants/cyclic-schedule';
import { LocationModel } from '../../../../models/location.model';

@Injectable({
  providedIn: 'root',
})

export class ScheduleService {
  scheduleDays: BehaviorSubject<ScheduleDay[]> = new BehaviorSubject<
    ScheduleDay[]
  >([]);

  constructor() {}

  getScheduleDays() {
    return this.scheduleDays.asObservable();
  }

  switchScheduleType(scheduleType: ScheduleType) {
    switch (scheduleType) {
      case ScheduleType.weekDays:
        this.initWeekDaysSchedule();
        break;
      case ScheduleType.cyclic:
        this.initCyclicSchedule();
        break;
      default:
        break;
    }
  }

  setScheduleDays(scheduleDays: ScheduleDay[]) {
    this.scheduleDays.next([...scheduleDays]);
  }

  initWeekDaysSchedule() {
    this.scheduleDays.next([...getInitialWeekDaysSchedule()]);
  }

  initCyclicSchedule() {
    this.scheduleDays.next([...getInitialCyclicSchedule()]);
  }

  generateCyclicSchedule(daysNumber: number) {
    const scheduleDays = generateCyclicSchedule(daysNumber);
    this.scheduleDays.next([...scheduleDays]);
  }

  updateScheduleDays(
    days: ScheduleDay[],
    location: LocationModel,
    isOffday: boolean,
    workTime: TimeRange,
    boundaryInTime: TimeRange,
    boundaryOutTime: TimeRange,
    breakTime: TimeRange
  ) {
    const scheduleDays = this.scheduleDays.getValue();

    // TODO: optimize
    const updatedScheduleDays = scheduleDays.map((scheduleDay) => {
      if (!days.includes(scheduleDay)) {
        return scheduleDay;
      }

      return this.updateScheduleDay(
        scheduleDay,
        location,
        isOffday,
        workTime,
        boundaryInTime,
        boundaryOutTime,
        breakTime
      );
    });

    this.scheduleDays.next([...updatedScheduleDays]);
  }

  private updateScheduleDay(
    scheduleDay: ScheduleDay,
    location: LocationModel,
    isOffday: boolean,
    workTime: TimeRange,
    boundaryInTime: TimeRange,
    boundaryOutTime: TimeRange,
    breakTime: TimeRange
  ): ScheduleDay {
    if (isOffday) {
      return {
        ...scheduleDay,
        isOffday,
        workSpans: [],
      };
    }

    return {
      ...scheduleDay,
      isOffday,
      workSpans: [
        {
          workTime,
          boundaryInTime: this.correctionBoundaryInTime(
            workTime,
            boundaryInTime
          ),
          boundaryOutTime: this.correctionBoundaryOutTime(
            workTime,
            boundaryOutTime
          ),
          breaks: [
            {
              time: breakTime?.start && breakTime?.end ? breakTime : null,
            },
          ],
          locationId: location?.id || null,
        },
      ],
    };
  }

  correctionBoundaryInTime(workTime: TimeRange, boundaryTime: TimeRange) {
    if (
      workTime.start.hour === workTime.end.hour &&
      boundaryTime.end.hour === 0
    ) {
      return {
        start: boundaryTime.start,
        end: { hour: 24, minute: boundaryTime.end.minute },
      };
    } else {
      return {
        start: boundaryTime.start,
        end: boundaryTime.end,
      };
    }
  }

  correctionBoundaryOutTime(workTime: TimeRange, boundaryTime: TimeRange) {
    if (
      workTime.start.hour === workTime.end.hour &&
      boundaryTime.start.hour === 0
    ) {
      return {
        start: { hour: 24, minute: boundaryTime.start.minute },
        end: boundaryTime.end,
      };
    } else {
      return {
        start: boundaryTime.start,
        end: boundaryTime.end,
      };
    }
  }

  getScheduleIntervals(days: ScheduleDay[]): {
    workTime: { start: Time; end: Time };
    breakTime: { start: Time; end: Time };
    boundaryInTime: { start: Time; end: Time };
    boundaryOutTime: { start: Time; end: Time };
  } {
    const day: ScheduleDay = days[0];
    return {
      workTime: {
        start: day?.workSpans?.[0]?.workTime?.start || {
          hour: 9,
          minute: 0,
        },

        end: day?.workSpans?.[0]?.workTime?.end || {
          hour: 18,
          minute: 0,
        },
      },
      boundaryInTime: {
        start: day?.workSpans?.[0]?.boundaryInTime?.start || {
          hour: 5,
          minute: 0,
        },
        end: day?.workSpans?.[0]?.boundaryInTime?.end || {
          hour: 9,
          minute: 0,
        },
      },
      boundaryOutTime: {
        start: day?.workSpans?.[0]?.boundaryOutTime?.start || {
          hour: 9,
          minute: 0,
        },
        end: day?.workSpans?.[0]?.boundaryOutTime?.end || {
          hour: 5,
          minute: 0,
        },
      },
      breakTime: {
        start: day?.workSpans?.[0]?.breaks?.[0]?.time?.start,
        end: day?.workSpans?.[0]?.breaks?.[0]?.time?.end,
      },
    };
  }

  resetSchedule() {
    this.scheduleDays.next([]);
  }
}
