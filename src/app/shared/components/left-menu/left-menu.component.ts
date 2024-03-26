import { Component, OnInit, Input } from '@angular/core';
import { Menu } from '../../models/menu.model';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { first } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OrganizationModel } from '../../../models/organization.model';
import { AuthorizeService } from '../../../auth/services/authorize.service';
import { OrganizationService } from '../../../services/organization.service';

@UntilDestroy()
@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})
export class LeftMenuComponent implements OnInit {
  @Input() isOpen: boolean;

  menus: Menu[] = [];
  menuItem: Menu;
  childrenPopupVisible = false;
  selectedMenuIndex: number;

  constructor(
    private router: Router,
    private authService: AuthorizeService,
    private organizationService: OrganizationService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.organizationService
      .getOrganizationById(this.authService.currentOrganizationId)
      .pipe(first())
      .subscribe((res: OrganizationModel) => {
        this.menus = this.menuService.init(res.usingNewSchedules);
      });
    this.setActiveSection(this.router.url);
    this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveSection(this.router.url);
      }
    });
  }

  isSectionVisible(menu: Menu): boolean {
    return menu.children.some((x) => x.visible);
  }

  setActiveSection(url: string) {
    this.menus.forEach((item: Menu) => {
      item.children.forEach((child) => {
        if (child.url === url) {
          item.expand = true;
        }
      });
    });
  }

  showChildrenPopup(menuItem: Menu, menuIndex: number) {
    this.selectedMenuIndex = menuIndex;
    this.menuItem = menuItem;
    this.childrenPopupVisible = true;
  }

  toggleChildrenSubmenu(menuItem: Menu, menuIndex: number) {
    this.selectedMenuIndex = menuIndex;
    this.menuItem = menuItem;
    menuItem.expand = !menuItem.expand;
    this.childrenPopupVisible = false;
  }

  hideChildrenPopup(menuItem: Menu) {
    this.menuItem = null;
    this.childrenPopupVisible = false;
  }
}
