import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@/constants/api.constants';
import { Transaction } from '@/models/budget.model';
import { PendingReceipt, SaveReceiptRequest, ScannedReceipt, StoredReceiptItem } from '@/models/receipt.model';

const BASE = `${API_URL}/receipts`;

@Service()
export class ReceiptService {
  private readonly http = inject(HttpClient);

  // Проверенные чеки ждут подтверждения на следующем экране
  readonly queue = signal<PendingReceipt[]>([]);

  // false, если такой чек уже в очереди
  enqueue(receipt: ScannedReceipt): boolean {
    if (this.queue().some((p) => p.receipt.receiptKey === receipt.receiptKey)) return false;
    this.queue.update((list) => [...list, { id: crypto.randomUUID(), receipt, categoryId: '', error: '' }]);
    return true;
  }

  patch(id: string, changes: Partial<Pick<PendingReceipt, 'categoryId' | 'error'>>): void {
    this.queue.update((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  remove(id: string): void {
    this.queue.update((list) => list.filter((p) => p.id !== id));
  }

  check(qrraw: string): Observable<ScannedReceipt> {
    return this.http.post<ScannedReceipt>(`${BASE}/check`, { qrraw });
  }

  // Распознавание QR на стороне сервиса: файл уходит на бэкенд и дальше в proverkacheka
  checkImage(file: File): Observable<ScannedReceipt> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<ScannedReceipt>(`${BASE}/check-image`, body);
  }

  save(request: SaveReceiptRequest): Observable<Transaction> {
    return this.http.post<Transaction>(BASE, request);
  }

  items(transactionId: string): Observable<StoredReceiptItem[]> {
    return this.http.get<StoredReceiptItem[]>(`${BASE}/${transactionId}/items`);
  }
}
