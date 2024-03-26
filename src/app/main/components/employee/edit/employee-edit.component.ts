import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs/operators';
import { EmployeeDetail } from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';

@UntilDestroy()
@Component({
  selector: 'app-edit-employee',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss'],
})
export class EmployeeEditComponent implements OnInit {
  currentEmployee: EmployeeDetail;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) =>
          this.employeeService.getEmployeeById(params['id'])
        ),
        untilDestroyed(this)
      )
      .subscribe((employee) => {
        this.currentEmployee = employee;
      });
  }

  navigateToEmployeeList(): void {
    this.router.navigate(['/employee']);
  }
}
