import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DataService } from '../data.service';
import { SpinnerOverlayService } from '../spinner-overlay.service';

// #000101 is almost fully off, i.e. volume is near 0, but is fully saturated and mid-way in the hue range.
const DEFAULT_COLOR = '#000101';

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
        this.onConnect();
      } else {
        this.onDisconnect();
      }
    });
  }

  private onConnect(): void {
    this.spinnerService.hide();

    // Tell the device to reflect the current color value.
    this.onChangeColor(this.color);
  }

  private onDisconnect(): void {
    this.spinnerService.show();

    this.color = DEFAULT_COLOR;
    this.speed = 0;
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

      // Ideally, the power-down would quickly be spotted as a disconnect and this would
      // trigger the call to `onDisconnect()` up above. But this doesn't happen in practice.
      this.onDisconnect();
    }
  }

  onSliderChange(event: MatSliderChange): void {
    // Note: `this.speed` is only updated when you stop dragging.
    console.log(event.value);

    this.dataService.sendMessage(`s ${event.value}`);
  }
}
