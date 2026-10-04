import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import QrScanner from 'qr-scanner';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '@/components/Layout/page-header';
import { ReceiptService } from '@/services/receipt.service';
import { errorMessage } from '@/utils/http-error';

// Строка из QR чека: t=...&s=...&fn=...&i=...&fp=...&n=...
const isReceiptQr = (raw: string) => /(^|&)t=/.test(raw) && /(^|&)fn=/.test(raw);

@Component({
  selector: 'app-scan',
  imports: [PageHeader],
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
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      await this.handle(result.data);
    } catch {
      this.error.set('QR-код на фото не найден. Попробуйте снять ближе или при лучшем свете.');
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

  private async handle(raw: string): Promise<void> {
    if (this.loading()) return;
    const qrraw = raw.trim();
    if (!isReceiptQr(qrraw)) {
      this.error.set('Это не QR-код чека');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    this.scanner?.stop();
    try {
      this.receipts.scanned.set(await firstValueFrom(this.receipts.check(qrraw)));
      await this.router.navigateByUrl('/budget/scan/confirm');
    } catch (error) {
      this.error.set(errorMessage(error));
      this.loading.set(false);
      if (this.cameraAvailable()) void this.startCamera();
    }
  }
}
