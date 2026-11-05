import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    AppComponent // Se importa aquí por ser Componente Standalone
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }