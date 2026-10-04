import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '@/core/api/api.constants';
import { Family, FamilyMember, Invite } from '@/core/family/family.model';
import { AuthService } from '@/core/auth/auth.service';

@Service()
export class FamilyService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly family = signal<Family | null>(null);
  readonly members = computed(() => this.family()?.members ?? []);

  get currentUserId(): string {
    return this.auth.user()?.id ?? '';
  }

  load(): Observable<Family> {
    return this.http.get<Family>(`${API_URL}/family`).pipe(tap((f) => this.family.set(f)));
  }

  createInvite(): Observable<Invite> {
    return this.http.post<Invite>(`${API_URL}/family/invites`, {});
  }

  member(id: string): FamilyMember | undefined {
    return this.members().find((m) => m.id === id);
  }
}
