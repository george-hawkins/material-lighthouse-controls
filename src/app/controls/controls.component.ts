import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DataService } from '../data.service';
import { SpinnerOverlayService } from '../spinner-overlay.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {
  powered = false;

  constructor(private dataService: DataService, private spinnerService: SpinnerOverlayService) { }

  ngOnInit(): void {
    this.spinnerService.setEnabled(true);

    this.dataService.connected$.subscribe(c => {
      this.powered = c;
      this.spinnerService.setEnabled(!c);
    })
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

  onPower(): void {
    this.powered = !this.powered;
    console.log('Powered', this.powered);

    if (!this.powered) {
      // Put the device into deepsleep.
      this.dataService.sendMessage('p');

      this.spinnerService.show();
    }
  }

  onSliderChange(event: MatSliderChange): void {
    console.log(event.value);

    this.dataService.sendMessage(`s ${event.value}`);
  }
}
