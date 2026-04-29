/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export type PurchaseOrderStatus = 'open' | 'partial' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: number;
  number: string;
  supplierId: number;
  supplierName?: string;
  orderDate: string;
  expectedReceiptDate?: string;
  status: PurchaseOrderStatus;
  totalAmount?: number;
}

export interface PurchaseOrderListParams {
  status?: PurchaseOrderStatus;
  supplierId?: number;
  expectedBefore?: string;
  expectedAfter?: string;
  limit?: number;
  cursor?: string;
}
