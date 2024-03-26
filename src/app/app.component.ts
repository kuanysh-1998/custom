import {
  Component,
  HostListener,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import DataGrid from 'devextreme/ui/data_grid';
import { LocalizationService } from './shared/services/localization.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { AuthorizeService } from './auth/services/authorize.service';
import { DialogService } from './shared/services/wp-dialog.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Workpace';

  constructor(
    private localization: LocalizationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private authService: AuthorizeService,
    private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef
  ) {
    DataGrid.defaultOptions({
      options: {
        syncLookupFilterValues: false,
        showRowLines: true,
        showBorders: true,
        columnAutoWidth: true,
        width: '100%',
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        sorting: {
          mode: 'multiple',
        },
      },
    });

    this.localization.initialize();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        mergeMap((_) => {
          var route = this.getChild(this.activatedRoute);
          return route.data;
        }),
        mergeMap((data) => this.localization.get(data.title))
      )
      .subscribe((titleText) => {
        this.titleService.setTitle(titleText + ' - Workpace');
      });

    this.dialogService.setViewContainerRef(this.viewContainerRef);
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (event.key === 'auth-jwt') {
      this.authService.reloadInCaseOfStaleAccessToken();
    }
  }

  getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }
}
