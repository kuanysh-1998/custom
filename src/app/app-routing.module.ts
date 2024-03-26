import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { PoliticsComponent } from './shared/components/politics/politics.component';
import { AuthorizeGuard } from './auth/guards/authorize.guard';
import { WpImgImportInstructionComponent } from './shared/components/instructions/wp-instruction-import-image/wp-instruction-import-image.component';
import { WpEmployeeImportInstructionComponent } from './shared/components/instructions/wp-import-instruction-excel/wp-import-instruction-excel.component';

const routes: Routes = [
  {
    path: 'authentication',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  { path: 'politics', component: PoliticsComponent },
  {
    path: 'zip-import-instructions',
    component: WpImgImportInstructionComponent,
    data: { title: 'Инструкция' },
    canActivate: [AuthorizeGuard],
  },
  {
    path: 'excel-import-instructions',
    component: WpEmployeeImportInstructionComponent,
    data: { title: 'Инструкция' },
    canActivate: [AuthorizeGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./main/main-layout.module').then((m) => m.MainLayoutModule),
  },
];

@NgModule({
  imports: [AuthModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
