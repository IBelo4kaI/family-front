import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, map, shareReplay, tap } from 'rxjs';
import { API_URL } from '@/core/api/api.constants';
import { JoinRequest, LoginRequest, RegisterRequest, Session, Tokens } from '@/core/auth/auth.model';

const STORAGE_KEY = 'family.session';

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(readSession());
  private refreshing$: Observable<Tokens> | null = null;

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  login(body: LoginRequest): Observable<Session> {
    return this.http.post<Session>(`${API_URL}/auth/login`, body).pipe(tap((s) => this.save(s)));
  }

  register(body: RegisterRequest): Observable<Session> {
    return this.http.post<Session>(`${API_URL}/auth/register`, body).pipe(tap((s) => this.save(s)));
  }

  join(body: JoinRequest): Observable<Session> {
    return this.http.post<Session>(`${API_URL}/auth/join`, body).pipe(tap((s) => this.save(s)));
  }

  // Параллельные 401 делят один запрос на обновление
  refresh(): Observable<Tokens> {
    const refreshToken = this.session()?.refreshToken;
    if (!refreshToken) return new Observable((s) => s.error(new Error('Нет сессии')));
    this.refreshing$ ??= this.http.post<Tokens>(`${API_URL}/auth/refresh`, { refreshToken }).pipe(
      tap((tokens) => {
        const current = this.session();
        if (current) this.save({ ...current, ...tokens });
      }),
      finalize(() => (this.refreshing$ = null)),
      shareReplay(1),
    );
    return this.refreshing$;
  }

  logout(): Observable<void> {
    const refreshToken = this.session()?.refreshToken;
    this.expire();
    if (!refreshToken) return new Observable((s) => s.complete());
    return this.http.post<void>(`${API_URL}/auth/logout`, { refreshToken }).pipe(map(() => undefined));
  }

  // Сессия недействительна: очистить и отправить на вход
  expire(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // хранилище недоступно, сессия остаётся только в памяти
    }
    void this.router.navigateByUrl('/login');
  }

  private save(session: Session): void {
    this.session.set(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // хранилище недоступно, сессия остаётся только в памяти
    }
  }
}
