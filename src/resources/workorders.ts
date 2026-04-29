import type { OracleDriver } from '../drivers/oracle/index.js';
import type { WebApiDriver } from '../drivers/webapi/index.js';
import { DriverNotConfiguredError } from '../errors.js';
import { getWorkOrder, listWorkOrders } from '../drivers/oracle/queries/workorders.js';
import type {
  PostProductionInput,
  WorkOrder,
  WorkOrderCreateInput,
  WorkOrderDetail,
  WorkOrderListParams,
} from '../types/workorders.js';

export class WorkOrdersResource {
  constructor(
    private readonly oracle: OracleDriver,
    private readonly webapi: WebApiDriver | null,
    private readonly defaultPageSize: number,
  ) {}

  list(params: WorkOrderListParams = {}): Promise<WorkOrder[]> {
    return listWorkOrders(this.oracle, params, this.defaultPageSize);
  }

  get(id: number): Promise<WorkOrderDetail | null> {
    return getWorkOrder(this.oracle, id);
  }

  async create(input: WorkOrderCreateInput): Promise<WorkOrder> {
    if (!this.webapi) throw new DriverNotConfiguredError('webapi', 'workorders.create');
    return this.webapi.createWorkOrder(input);
  }

  async postProduction(input: PostProductionInput): Promise<void> {
    if (!this.webapi) throw new DriverNotConfiguredError('webapi', 'workorders.postProduction');
    return this.webapi.postProduction(input);
  }
}
