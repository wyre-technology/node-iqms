import type { OracleDriver } from '../drivers/oracle/index.js';
import { listPurchaseOrders } from '../drivers/oracle/queries/purchase-orders.js';
import type { PurchaseOrder, PurchaseOrderListParams } from '../types/purchase-orders.js';

export class PurchaseOrdersResource {
  constructor(
    private readonly oracle: OracleDriver,
    private readonly defaultPageSize: number,
  ) {}

  list(params: PurchaseOrderListParams = {}): Promise<PurchaseOrder[]> {
    return listPurchaseOrders(this.oracle, params, this.defaultPageSize);
  }
}
