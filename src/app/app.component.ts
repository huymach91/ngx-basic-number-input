import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  form = this.formBuilder.group({
    number: this.formBuilder.control(''),
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    setTimeout(() => {
      this.form.reset({
        number: '12a',
      });
    }, 500);
  }
}
