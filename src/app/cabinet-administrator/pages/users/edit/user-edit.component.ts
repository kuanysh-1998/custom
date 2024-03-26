import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tab } from 'src/app/shared/components/wp-tab-panel/wp-tab-panel.component';
import { UserDataComponent } from './data/user-data-edit.component';
import { switchMap } from 'rxjs/operators';
import { CurrentUserService } from 'src/app/cabinet-administrator/services/current-user.service';
import { UserRightsComponent } from './rights/user-rights.component';
import { PasswordVisibilityService } from 'src/app/cabinet-administrator/services/password-visibility.service';
import { EmployeeDetail } from 'src/app/models/employee.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  providers: [CurrentUserService, PasswordVisibilityService],
})
export class UserEditComponent implements OnInit {
  userById: EmployeeDetail;

  userTabs: Tab[] = [
    {
      title: 'Данные пользователя',
      component: UserDataComponent,
    },
    {
      title: 'Права пользователя',
      component: UserRightsComponent,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) =>
          this.currentUserService.getCurrentUserByEmployeeId(params['id'])
        ),
        untilDestroyed(this) 
      )
      .subscribe((user) => {
        this.userById = user;
        this.currentUserService.setCurrentUser(user);
      });
  }

  returnToUsersPage(): void {
    this.router.navigate(['/administrator/users']);
  }
}
