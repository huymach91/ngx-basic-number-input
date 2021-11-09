import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { INumberInputOptional } from './ngx-basic-number-input/ts-number-input';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  form = this.formBuilder.group({
    number: this.formBuilder.control(''),
  });

  decimal = '12.05';
  percentage = '';

  public numberInputConfig: INumberInputOptional = {
    separator: ',',
    fractionDigits: 0,
  };

  public decimalInputConfig: INumberInputOptional = {
    separator: ',',
    fractionDigits: 2,
  };

  public percentageInputConfig: INumberInputOptional = {
    separator: ',',
    fractionDigits: 3,
    percentage: true,
  };

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    setTimeout(() => {
      this.form.reset({
        number: '12a',
      });
    }, 500);
  }
}
