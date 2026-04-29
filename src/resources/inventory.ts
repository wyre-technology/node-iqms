import type { OracleDriver } from '../drivers/oracle/index.js';
import type { WebApiDriver } from '../drivers/webapi/index.js';
import { DriverNotConfiguredError } from '../errors.js';
import { listOnHand, traceLot } from '../drivers/oracle/queries/inventory.js';
import type {
  InventoryAdjustmentInput,
  InventoryOnHand,
  InventoryOnHandParams,
  LotTraceNode,
  LotTraceParams,
} from '../types/inventory.js';

export class InventoryResource {
  constructor(
    private readonly oracle: OracleDriver,
    private readonly webapi: WebApiDriver | null,
    private readonly defaultPageSize: number,
  ) {}

  onHand(params: InventoryOnHandParams = {}): Promise<InventoryOnHand[]> {
    return listOnHand(this.oracle, params, this.defaultPageSize);
  }

  trace(params: LotTraceParams): Promise<LotTraceNode[]> {
    return traceLot(this.oracle, params);
  }

  async adjust(input: InventoryAdjustmentInput): Promise<void> {
    if (!this.webapi) throw new DriverNotConfiguredError('webapi', 'inventory.adjust');
    return this.webapi.adjustInventory(input);
  }
}
