import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { EmpresaService } from '../../../services/empresa.service';
import { SesionService } from '../../../services/sesion.service';
import { SesionSwitcher } from '../sesion-switcher/sesion-switcher';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule, Select, SesionSwitcher],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  readonly empresaService = inject(EmpresaService);
  readonly sesionService = inject(SesionService);
}
