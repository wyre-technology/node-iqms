import type { WebApiConfig } from '../../config.js';
import { NotImplementedError } from '../../errors.js';
import { WebApiHttpClient } from './http.js';
import type {
  WorkOrderCreateInput,
  PostProductionInput,
} from '../../types/workorders.js';
import type { InventoryAdjustmentInput } from '../../types/inventory.js';
import type { NcrCreateInput, NonConformance } from '../../types/quality.js';
import type { WorkOrder } from '../../types/workorders.js';

/**
 * Driver for the DELMIAworks WebAPI module (licensed add-on).
 *
 * @remarks
 * **All methods are currently stubs** that throw `NotImplementedError`. The
 * WebAPI module has no public documentation; finalizing endpoint paths,
 * payload shapes, and the auth handshake requires access to the vendor SDK
 * and a design-partner instance.
 */
export interface WebApiDriver {
  createWorkOrder(input: WorkOrderCreateInput): Promise<WorkOrder>;
  postProduction(input: PostProductionInput): Promise<void>;
  adjustInventory(input: InventoryAdjustmentInput): Promise<void>;
  createNcr(input: NcrCreateInput): Promise<NonConformance>;
  /** Release HTTP keep-alive sockets / clear any in-flight session token. */
  close(): Promise<void>;
}

export function createWebApiDriver(config: WebApiConfig): WebApiDriver {
  const http = new WebApiHttpClient(config);

  return {
    async createWorkOrder(_input) {
      // TODO: validate against vendor SDK — endpoint shape unconfirmed.
      throw new NotImplementedError('webapi.createWorkOrder');
    },
    async postProduction(_input) {
      throw new NotImplementedError('webapi.postProduction');
    },
    async adjustInventory(_input) {
      throw new NotImplementedError('webapi.adjustInventory');
    },
    async createNcr(_input) {
      throw new NotImplementedError('webapi.createNcr');
    },
    async close() {
      await http.close();
    },
  };
}
