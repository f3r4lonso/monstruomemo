import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterLayoutComponent } from '@layout/footer-layout.component';
import { HeaderLayoutComponent } from '@layout/header-layout.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, HeaderLayoutComponent, FooterLayoutComponent],
  templateUrl: './app.component.html'
})
export class PokedexLayoutComponent {}
