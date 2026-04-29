/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export type SalesOrderStatus = 'open' | 'partial' | 'shipped' | 'cancelled';

export interface SalesOrder {
  id: number;
  number: string;
  customerId: number;
  customerName?: string;
  orderDate: string;
  requestedShipDate?: string;
  status: SalesOrderStatus;
  totalAmount?: number;
}

export interface SalesOrderListParams {
  status?: SalesOrderStatus;
  customerId?: number;
  shipBefore?: string;
  shipAfter?: string;
  limit?: number;
  cursor?: string;
}
