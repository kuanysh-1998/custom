import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthorizeService } from '../../auth/services/authorize.service';
import {PermissionEnum} from "../models/permission.enum";

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit {
  constructor(private authService: AuthorizeService, private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) {
  }

  @Input()
  set hasPermission(permission: PermissionEnum) {
    
    const authPermissions = this.authService.getPermissions();
    if (authPermissions.includes(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }else{
      this.viewContainer.clear();
    }
  }

  ngOnInit(): void {
  }
}
