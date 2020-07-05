import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DataService } from '../data.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  onChangeColor(color: string): void {
    console.log('Color changed:', color);

    const rgb = color.substring(1)
      .match(/.{2}/g)
      ?.map(x => parseInt(x, 16))
      .join(' ');

    this.dataService.sendMessage(`c ${rgb}`);
  }

  onReverse(): void {
    console.log('Reverse');

    this.dataService.sendMessage('r');
  }

  onSliderChange(event: MatSliderChange): void {
    console.log(event.value);

    this.dataService.sendMessage(`s ${event.value}`);
  }
}
