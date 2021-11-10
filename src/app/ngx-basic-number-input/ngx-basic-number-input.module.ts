import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxBasicNumberInputDirective } from './ngx-basic-number-input.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [NgxBasicNumberInputDirective],
  exports: [NgxBasicNumberInputDirective],
})
export class NgxBasicNumberInputModule {}
