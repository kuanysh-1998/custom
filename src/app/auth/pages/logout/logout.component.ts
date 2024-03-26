import {Component, OnInit} from '@angular/core';
import {AuthorizeService} from '../../services/authorize.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  constructor(private authorizeService: AuthorizeService) {
  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = this.authorizeService.isLoggedIn();
    if (isAuthenticated) {
      this.authorizeService.logout();
      return;
    }
    this.authorizeService.redirectToMainPage();
  }
}
