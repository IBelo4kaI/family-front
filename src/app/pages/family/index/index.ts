import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { Invite } from '@/models/family.model';
import { AuthService } from '@/services/auth.service';
import { FamilyService } from '@/services/family.service';
import { errorMessage } from '@/utils/http-error';

@Component({
  selector: 'app-family',
  imports: [PageHeader, DatePipe],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class FamilyPage {
  private readonly auth = inject(AuthService);
  protected readonly family = inject(FamilyService);

  protected readonly invite = signal<Invite | null>(null);
  protected readonly inviteError = signal('');

  protected createInvite(): void {
    this.inviteError.set('');
    this.family.createInvite().subscribe({
      next: (invite) => this.invite.set(invite),
      error: (error: unknown) => this.inviteError.set(errorMessage(error)),
    });
  }

  protected logout(): void {
    this.auth.logout().subscribe({ error: () => undefined });
  }
}
