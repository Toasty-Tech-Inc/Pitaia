import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiRoot, TUI_DARK_MODE } from '@taiga-ui/core';

@Component({
  imports: [RouterModule, TuiRoot],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected title = 'dashboard';
}
