import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DataService } from '../data.service';
import { SpinnerOverlayService } from '../spinner-overlay.service';

// #3f7f7f is a color that places you in the center of the hue slider and the saturation/volume panel.
const DEFAULT_COLOR = '#3f7f7f';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {
  speed = 0;
  color = DEFAULT_COLOR;
  powered = false;

  constructor(private dataService: DataService, private spinnerService: SpinnerOverlayService) { }

  ngOnInit(): void {
    this.spinnerService.show();

    this.dataService.connected$.subscribe(c => {
      this.powered = c;

      if (c) {
        this.spinnerService.hide();

        // Tell the device to show the initial color.
        this.onChangeColor(this.color);
      } else {
        this.spinnerService.show();

        this.color = DEFAULT_COLOR;
        this.speed = 0;
      }
    });
  }

  onChangeColor(event: string): void {
    // Like with `this.speed`, `this.color` is only updated when you stop dragging.
    console.log('Color changed:', event);

    const rgb = event.substring(1)
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
    console.log('Powered', this.powered);

    if (!this.powered) {
      // Put the device into deepsleep.
      this.dataService.sendMessage('p');

      this.spinnerService.show();
    }
  }

  onSliderChange(event: MatSliderChange): void {
    // Note: `this.speed` is only updated when you stop dragging.
    console.log(event.value);

    this.dataService.sendMessage(`s ${event.value}`);
  }
}
