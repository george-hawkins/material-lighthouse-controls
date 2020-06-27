import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private readonly LOCATION = 'assets/svg/icons.svg';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private location: Location
  ) { }

  registerIcons(): void {
    const url = this.location.prepareExternalUrl(this.LOCATION);
    const safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    this.matIconRegistry.addSvgIconSet(safeUrl);
  }
}
