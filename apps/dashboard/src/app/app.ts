import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  imports: [NxWelcome, RouterModule, TuiRoot],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'dashboard';
}
