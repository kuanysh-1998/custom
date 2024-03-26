import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ScheduleAPIService } from '../../../../services/schedule-api.service';
import { Schedule } from '../models/schedule-models';

@Injectable({
  providedIn: 'root',
})
export class ScheduleResolver
  
{
  constructor(private scheduleAPIService: ScheduleAPIService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Schedule> | null {
    const id = route.paramMap.get('id');
    if (id === 'new' || !id) {
      return null;
    }

    return this.scheduleAPIService.getSchedule(id);
  }
}
