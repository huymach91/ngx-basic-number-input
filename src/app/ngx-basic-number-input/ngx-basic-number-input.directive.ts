import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Provider,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { INumberInputOptional, NumberInput } from './ts-number-input';

const CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgxBasicNumberInputDirective),
  multi: true,
};

@Directive({
  selector: '[ngx-basic-number-input]',
  providers: [CONTROL_VALUE_ACCESSOR],
})
export class NgxBasicNumberInputDirective
  implements ControlValueAccessor, OnInit
{
  private onTouched!: Function;
  private onChanged!: Function;

  @Input('config') config: INumberInputOptional = {
    separator: ',',
    fractionDigits: 0,
  };

  private inputRef: NumberInput;

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.inputRef = new NumberInput(this.element.nativeElement, this.config);
  }

  @HostListener('inputChange', ['$event'])
  onChange(event: any) {
    if (!this.onChanged) return;
    this.onChanged(event.detail);
    this.onTouched();
  }

  writeValue(value: string): void {
    if (!value) return;
    const formatted = value ? value.replace(/[^0-9\.\,]/, '') : '';
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
