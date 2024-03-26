import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import {AuthorizeService} from "../services/authorize.service";
import {PermissionEnum} from "../../shared/models/permission.enum";

@Injectable({
  providedIn: "root"
})
export class PermissionGuardService  {
  constructor(private router: Router, private authService: AuthorizeService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let routePermissions = route.data["permissions"] as Array<PermissionEnum>;
    let isAnyPermission = false;
    const authPermissions = this.authService.getPermissions();
    routePermissions.forEach(x => {
      if (authPermissions.includes(x)) {
        isAnyPermission = true;
      }
    });
    if (isAnyPermission) {
      return isAnyPermission;
    }
    this.router.navigate(["/"], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
