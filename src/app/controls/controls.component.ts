import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {
  onChangeColor(color: string): void {
    console.log('Color changed:', color);
  }

  onReverse(): void {
    console.log('Reverse');
  }

  onSliderChange(event: MatSliderChange): void {
    console.log(event.value);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
