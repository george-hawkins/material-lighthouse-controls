import { Component, OnInit } from '@angular/core';
import { IconService } from './icon.service';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private iconService: IconService, private dataService: DataService) { }

  ngOnInit(): void {
    this.iconService.registerIcons();
    this.dataService.connect();
  }
}
