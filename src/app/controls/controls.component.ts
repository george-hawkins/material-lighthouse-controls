import { Component, OnInit } from '@angular/core';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {
  width: number = 0;

  onChangeColor(color: string): void {
    console.log('Color changed:', color);
  }

  onReverse(): void {
    console.log('Reverse');
  }

  onSliderChange(event: MatSliderChange): void {
    console.log(event.value);
  }

  constructor(private ruler: ViewportRuler) { }

  ngOnInit(): void {
    this.width = this.ruler.getViewportSize().width;
    this.ruler.change().subscribe(() => this.width = this.ruler.getViewportSize().width);
  }

}
