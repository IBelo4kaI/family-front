import { Component, DestroyRef, computed, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import QrScanner from 'qr-scanner';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '@/components/Layout/page-header';
import { ReceiptService } from '@/services/receipt/receipt.service';
import { ScannedReceipt } from '@/models/receipt.model';
import { errorMessage } from '@/utils/http-error';

const MAX_PHOTOS = 50;
const CONFIRM_URL = '/budget/scan/confirm';

interface FailedPhoto {
  name: string;
  message: string;
}

// Строка из QR чека: t=...&s=...&fn=...&i=...&fp=...&n=...
const isReceiptQr = (raw: string) => /(^|&)t=/.test(raw) && /(^|&)fn=/.test(raw);

@Component({
  selector: 'app-scan',
  imports: [PageHeader, RouterLink],
  templateUrl: './scan.html',
  styleUrl: './scan.css',
})
export class Scan {
  private readonly receipts = inject(ReceiptService);
  private readonly router = inject(Router);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private scanner?: QrScanner;

  protected readonly loading = signal(false);
  protected readonly cameraAvailable = signal(true);
  protected readonly error = signal('');
  protected readonly manual = signal('');
  protected readonly notice = signal('');
  protected readonly failed = signal<FailedPhoto[]>([]);
  protected readonly progress = signal<{ current: number; total: number } | null>(null);
  protected readonly queueSize = computed(() => this.receipts.queue().length);

  constructor() {
    afterNextRender(() => void this.startCamera());
    inject(DestroyRef).onDestroy(() => this.scanner?.destroy());
  }

  protected onManualInput(event: Event): void {
    this.manual.set((event.target as HTMLTextAreaElement).value);
  }

  protected submitManual(): void {
    void this.handle(this.manual());
  }

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length || this.loading()) return;

    const selected = files.slice(0, MAX_PHOTOS);
    this.error.set('');
    this.notice.set(
      files.length > MAX_PHOTOS ? `Можно загрузить не больше ${MAX_PHOTOS} фото за раз, обработаны первые ${MAX_PHOTOS}.` : '',
    );
    this.failed.set([]);
    this.loading.set(true);
    this.scanner?.stop();

    // По одному: внешний сервис ограничивает частоту запросов
    const failed: FailedPhoto[] = [];
    for (const [index, file] of selected.entries()) {
      this.progress.set({ current: index + 1, total: selected.length });
      try {
        this.add(await this.recognize(file));
      } catch (error) {
        failed.push({ name: file.name, message: errorMessage(error) });
      }
    }
    this.progress.set(null);
    this.failed.set(failed);
    this.loading.set(false);

    if (!failed.length && this.receipts.queue().length) {
      await this.router.navigateByUrl(CONFIRM_URL);
    } else if (this.cameraAvailable()) {
      void this.startCamera();
    }
  }

  protected async restart(): Promise<void> {
    this.error.set('');
    await this.startCamera();
  }

  private async startCamera(): Promise<void> {
    if (this.scanner) {
      try {
        await this.scanner.start();
      } catch {
        this.cameraAvailable.set(false);
      }
      return;
    }
    // Камера работает только по HTTPS или на localhost
    if (!(await QrScanner.hasCamera())) {
      this.cameraAvailable.set(false);
      return;
    }
    this.scanner = new QrScanner(this.video().nativeElement, (result) => void this.handle(result.data), {
      preferredCamera: 'environment',
      highlightScanRegion: true,
      highlightCodeOutline: true,
      returnDetailedScanResult: true,
    });
    try {
      await this.scanner.start();
    } catch {
      this.cameraAvailable.set(false);
      this.error.set('Нет доступа к камере. Загрузите фото чека или введите данные вручную.');
    }
  }

  private async recognize(file: File): Promise<ScannedReceipt> {
    let raw: string;
    try {
      raw = (await QrScanner.scanImage(file, { returnDetailedScanResult: true })).data;
    } catch {
      // Локально QR не нашёлся: пусть попробует сервис
      return firstValueFrom(this.receipts.checkImage(file));
    }
    if (!isReceiptQr(raw.trim())) throw new Error('Это не QR-код чека');
    return firstValueFrom(this.receipts.check(raw.trim()));
  }

  private add(receipt: ScannedReceipt): void {
    if (!this.receipts.enqueue(receipt)) throw new Error('Этот чек уже в очереди');
  }

  private async handle(raw: string): Promise<void> {
    if (this.loading()) return;
    const qrraw = raw.trim();
    if (!isReceiptQr(qrraw)) {
      this.error.set('Это не QR-код чека');
      return;
    }

    this.error.set('');
    this.failed.set([]);
    this.loading.set(true);
    this.scanner?.stop();
    try {
      this.add(await firstValueFrom(this.receipts.check(qrraw)));
      await this.router.navigateByUrl(CONFIRM_URL);
    } catch (error) {
      this.error.set(errorMessage(error));
      this.loading.set(false);
      if (this.cameraAvailable()) void this.startCamera();
    }
  }
}
