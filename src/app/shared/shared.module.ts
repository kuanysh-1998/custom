import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import {DxTemplateModule} from 'devextreme-angular/core';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxContextMenuModule } from 'devextreme-angular/ui/context-menu';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxDateRangeBoxModule } from 'devextreme-angular/ui/date-range-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxListModule } from 'devextreme-angular/ui/list';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTagBoxModule } from 'devextreme-angular/ui/tag-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { DxRadioGroupModule } from 'devextreme-angular/ui/radio-group';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';

import { ComboDropdownListComponent } from './components/combo-dropdown-list/combo-dropdown-list.component';
import { WpPopupComponent } from './components/wp-popup/wp-popup.component';
import { WpTabComponent } from './components/wp-tab-panel/wp-tab-panel.component';
import { WpMessageComponent } from './components/wp-message/wp-message.component';
import { WpColorPickerComponent } from './components/wp-color-picker/wp-color-picker.component';
import { WpTimePickerComponent } from './components/wp-time-picker/wp-time-picker.component';
import { WpPhotoPopupComponent } from './components/wp-photo-popup/wp-photo-popup.component';
import { EditTimetableComponent } from './components/edit-timetable/edit-timetable.component';
import { WpSwitchComponent } from './components/wp-switch/wp-switch.component';
import { WpTextBoxComponent } from './components/wp-text-box/wp-text-box.component';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { InstructionBannerComponent } from './components/instructions/wp-banner-component/wp-banner.component';
import { WpImgImportInstructionComponent } from './components/instructions/wp-instruction-import-image/wp-instruction-import-image.component';
import { WpEmployeeImportInstructionComponent } from './components/instructions/wp-import-instruction-excel/wp-import-instruction-excel.component';
import { ControlMessagesComponent } from './components/error-messages/error-messages.component';
import { SingleAccordionComponent } from './components/single-accordion/single-accordion.component';
import { NotificationPageComponent } from './components/notification-page/notification-page.component';

import { ValidateControlDirective } from './directives/dx-validator.directive';

import { SecurePipe } from './pipes/secure.pipe';
import { TimetableStatusPipe } from './pipes/timetable-status.pipe';
import { LabelComponent } from './wk-components/lib/label/label.component';
import { FormErrorComponent } from './wk-components/lib/form-error/form-error.component';
import { SvgComponent } from './wk-components/lib/svg/svg.component';
import { TextFieldComponent } from './wk-components/lib/text-field/text-field.component';
import { SpinnerComponent } from './wk-components/lib/spinner/spinner.component';
import { AutocompletePipe } from './wk-components/lib/autocomplete/autocomplete.pipe';
import { ButtonComponent } from './wk-components/lib/button/button.component';
import { ScrollComponent } from './wk-components/lib/scroll/scroll.component';
import { ListItemComponent } from './wk-components/lib/list-item/list-item.component';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DropdownComponent } from './wk-components/lib/dropdown/dropdown.component';
import { CheckboxComponent } from './wk-components/lib/checkbox/checkbox.component';
import { RouterModule } from '@angular/router';
import { TooltipComponent } from './wk-components/lib/tooltip/tooltip.component';
import { LinkComponent } from './wk-components/lib/link/link.component';
import { TooltipDirective } from './wk-components/lib/tooltip/tooltip.directive';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  declarations: [
    ControlMessagesComponent,
    NotificationPageComponent,
    SingleAccordionComponent,
    SecurePipe,
    WpTabComponent,
    WpPopupComponent,
    ValidateControlDirective,
    ComboDropdownListComponent,
    WpMessageComponent,
    WpColorPickerComponent,
    WpTimePickerComponent,
    WpPhotoPopupComponent,
    EditTimetableComponent,
    TimetableStatusPipe,
    WpSwitchComponent,
    WpTextBoxComponent,
    InstructionBannerComponent,
    WpImgImportInstructionComponent,
    WpEmployeeImportInstructionComponent,
    DropdownMenuComponent,

    LabelComponent,
    FormErrorComponent,
    SvgComponent,
    TextFieldComponent,
    ScrollComponent,
    ButtonComponent,
    AutocompletePipe,
    SpinnerComponent,
    ListItemComponent,
    DropdownComponent,
    CheckboxComponent,
    TooltipComponent,
    LinkComponent,
    TooltipDirective,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgOptimizedImage,
    DxPopoverModule,
    DxListModule,
    DxSelectBoxModule,
    DxDropDownBoxModule,
    DxTagBoxModule,
    DxTextBoxModule,
    DxValidatorModule,
    DxTabPanelModule,
    DxTemplateModule,
    DxPopupModule,
    DxDataGridModule,
    DxCheckBoxModule,
    DxContextMenuModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxDateRangeBoxModule,
    DxButtonModule,
    DxDropDownBoxModule,
    DxPopoverModule,
    DxListModule,
    DxTagBoxModule,
    DxTextAreaModule,
    DxToolbarModule,
    FormsModule,
    DxRadioGroupModule,
    DxLoadIndicatorModule,
    DxScrollViewModule,
    RouterModule,
    DxTooltipModule,
    AngularSvgIconModule
  ],

  exports: [
    TranslateModule,
    DxValidatorModule,
    DxTabPanelModule,
    DxTemplateModule,
    DxPopupModule,
    DxDataGridModule,
    FormsModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxContextMenuModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxDateRangeBoxModule,
    DxButtonModule,
    DxDropDownBoxModule,
    DxPopoverModule,
    DxListModule,
    DxTagBoxModule,
    ReactiveFormsModule,
    DxTextAreaModule,
    DxToolbarModule,
    DxLoadIndicatorModule,
    DxRadioGroupModule,

    ControlMessagesComponent,
    SingleAccordionComponent,
    WpTabComponent,
    WpPopupComponent,
    ComboDropdownListComponent,
    WpMessageComponent,
    WpColorPickerComponent,
    WpTimePickerComponent,
    WpPhotoPopupComponent,
    EditTimetableComponent,
    WpSwitchComponent,
    WpTextBoxComponent,
    InstructionBannerComponent,
    WpImgImportInstructionComponent,
    WpEmployeeImportInstructionComponent,
    DropdownMenuComponent,

    SecurePipe,
    TimetableStatusPipe,

    ValidateControlDirective,

    LabelComponent,
    FormErrorComponent,
    SvgComponent,
    TextFieldComponent,
    ScrollComponent,
    ButtonComponent,
    AutocompletePipe,
    SpinnerComponent,
    ListItemComponent,
    DxScrollViewModule,
    DropdownComponent,
    CheckboxComponent,
    RouterModule,
    TooltipComponent,
    LinkComponent,
    TooltipDirective,
    DxTooltipModule,
    AngularSvgIconModule
  ],
})
export class SharedModule {}
