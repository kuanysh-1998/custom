import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AuthorizeService} from "../services/authorize.service";
import {PermissionEnum} from "../../shared/models/permission.enum";

@Injectable({
  providedIn: "root"
})
export class AvailableChildGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthorizeService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const authPermissions = this.authService.getPermissions();
    for (const child of route.data['children']) {
      let routePermissions = child.data["permissions"] as Array<PermissionEnum>;
      let isAnyPermission = false;
      routePermissions.forEach(x => {
        if (authPermissions.includes(x)) {
          isAnyPermission = true;
        }
      });
      if (isAnyPermission) {

        this.router.navigate([state.url,child.path]);
        return true;
      }
    }

    return false;
  }
}
