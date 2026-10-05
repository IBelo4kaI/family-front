import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Invite } from '@/core/family/family.model';
import { AuthService } from '@/core/auth/auth.service';
import { FamilyService } from '@/core/family/family.service';
import { errorMessage } from '@/shared/utils/http-error';

@Component({
  selector: 'app-family',
  imports: [DatePipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
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
