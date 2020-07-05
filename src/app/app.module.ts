import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { ColorPickerModule } from 'ngx-color-picker';

import { AppComponent } from './app.component';
import { ControlsComponent } from './controls/controls.component';

// Even without any routes, I still need to configure a router module,
// otherwise the dependencies of Location aren't properly configured and
// Location.prepareExternalUrl(...) will always behave as if the base href is "/".
@NgModule({
  declarations: [
    AppComponent,
    ControlsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    MatButtonModule,
    MatSliderModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
