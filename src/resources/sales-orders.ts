import type { OracleDriver } from '../drivers/oracle/index.js';
import { listSalesOrders } from '../drivers/oracle/queries/sales-orders.js';
import type { SalesOrder, SalesOrderListParams } from '../types/sales-orders.js';

export class SalesOrdersResource {
  constructor(
    private readonly oracle: OracleDriver,
    private readonly defaultPageSize: number,
  ) {}

  list(params: SalesOrderListParams = {}): Promise<SalesOrder[]> {
    return listSalesOrders(this.oracle, params, this.defaultPageSize);
  }
}
