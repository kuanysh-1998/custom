import {
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavBarComponent implements OnDestroy {
  @ViewChild('tabBar', { static: false }) tabBar: ElementRef;

  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;
  isOpen = true;
  isCollapsed = false;

  constructor(
    @Inject(LOCALE_ID) public localeId: string,
    media: MediaMatcher,
    private ngZone: NgZone
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => this.updateMenuState();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
    this.updateMenuState();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen && this.mobileQuery.matches) {
      this.isCollapsed = true;
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.isOpen = !this.isCollapsed;
  }

  private updateMenuState() {
    this.ngZone.run(() => {
      if (this.mobileQuery.matches) {
        this.isCollapsed = true;
        this.isOpen = false;
      } else {
        this.isCollapsed = false;
        this.isOpen = true;
      }
    });
  }
}
