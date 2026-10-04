export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  sum: number;
}

export interface ScannedReceipt {
  receiptKey: string;
  date: string;
  totalSum: number;
  sellerInn: string;
  sellerName: string;
  items: ReceiptItem[];
}

export interface PendingReceipt {
  id: string;
  receipt: ScannedReceipt;
  categoryId: string;
  error: string;
}

export interface SaveReceiptRequest extends ScannedReceipt {
  categoryId: string;
  scope: 'personal' | 'family';
}

export interface StoredReceiptItem extends ReceiptItem {
  id: string;
  position: number;
  categoryId: string | null;
}
