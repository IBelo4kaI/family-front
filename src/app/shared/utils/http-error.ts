import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = (error.error as { error?: string } | null)?.error;
    if (message) return message;
    if (error.status === 0) return 'Нет связи с сервером';
  }
  return 'Что-то пошло не так, попробуйте ещё раз';
}
