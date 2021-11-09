import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Provider,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NumberInput } from './ts-number-input';

const CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgxBasicNumberInputComponent),
  multi: true,
};

@Directive({
  selector: '[ngx-basic-number-input]',
  providers: [CONTROL_VALUE_ACCESSOR],
})
export class NgxBasicNumberInputComponent implements ControlValueAccessor {
  private onTouched!: Function;
  private onChanged!: Function;

  private inputRef: NumberInput;

  constructor(private element: ElementRef) {
    this.inputRef = new NumberInput(this.element.nativeElement, {
      separator: ',',
      fractionDigits: 1,
    });
  }

  @HostListener('inputChange', ['$event'])
  onChange(event: any) {
    if (!this.onChanged) return;
    this.onChanged(event.detail);
    this.onTouched();
  }

  writeValue(value: string): void {
    const formatted = value ? value.replace(/[^0-9]/, '') : '0';
    (this.element.nativeElement as HTMLInputElement).value =
      this.inputRef.format(formatted);
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
