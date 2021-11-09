import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxBasicNumberInputComponent } from './ngx-basic-number-input.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [NgxBasicNumberInputComponent],
  exports: [NgxBasicNumberInputComponent],
})
export class NgxBasicNumberInputModule {}
