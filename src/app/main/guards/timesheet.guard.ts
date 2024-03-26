import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { AuthorizeService } from '../../auth/services/authorize.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimesheetGuard  {
  constructor(
    private organizationService: OrganizationService,
    private authService: AuthorizeService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    const organization = this.organizationService.getCurrentOrganization();

    if (!organization) {
      return this.organizationService
        .getOrganizationById(this.authService.currentOrganizationId)
        .pipe(
          map((organization) => {
            return this.isUsingNewSchedules(
              organization?.usingNewSchedules,
              route.routeConfig.path
            );
          })
        );
    }

    return this.isUsingNewSchedules(
      organization.usingNewSchedules,
      route.routeConfig.path
    );
  }

  private isUsingNewSchedules(
    usingNewSchedules: boolean,
    routeUrl: string
  ): UrlTree | boolean {
    switch (routeUrl) {
      case 'timesheet':
        if (usingNewSchedules) {
          return this.router.createUrlTree(['/timesheet2']);
        }
        return true;
      case 'timesheet2':
        if (!usingNewSchedules) {
          return this.router.createUrlTree(['/timesheet']);
        }
        return true;
    }
  }
}
