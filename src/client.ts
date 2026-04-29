import type { IqmsConfig } from './config.js';
import { createOracleDriver, type OracleDriver } from './drivers/oracle/index.js';
import { createWebApiDriver, type WebApiDriver } from './drivers/webapi/index.js';
import { WorkOrdersResource } from './resources/workorders.js';
import { InventoryResource } from './resources/inventory.js';
import { BomsResource } from './resources/boms.js';
import { SalesOrdersResource } from './resources/sales-orders.js';
import { PurchaseOrdersResource } from './resources/purchase-orders.js';
import { ScheduleResource } from './resources/schedule.js';
import { QualityResource } from './resources/quality.js';

/**
 * Optional driver overrides — exposed primarily so the test suite can inject
 * a fake Oracle driver without requiring `oracledb` and Instant Client.
 */
export interface IqmsClientOverrides {
  oracleDriver?: OracleDriver;
  webApiDriver?: WebApiDriver;
}

/**
 * Top-level entry point. Construct via {@link IqmsClient.create} (async, builds
 * the production drivers) or call the constructor directly with injected
 * drivers (sync, primarily for tests).
 *
 * @example
 * ```ts
 * const client = await IqmsClient.create({
 *   oracle: { user: 'eiq_ro', password: '…', connectString: 'host:1521/EIQ' },
 * });
 * ```
 */
export class IqmsClient {
  readonly workorders: WorkOrdersResource;
  readonly inventory: InventoryResource;
  readonly boms: BomsResource;
  readonly salesOrders: SalesOrdersResource;
  readonly purchaseOrders: PurchaseOrdersResource;
  readonly schedule: ScheduleResource;
  readonly quality: QualityResource;

  private readonly oracle: OracleDriver;
  private readonly webapi: WebApiDriver | null;

  constructor(
    config: Pick<IqmsConfig, 'defaultPageSize'>,
    drivers: { oracle: OracleDriver; webapi: WebApiDriver | null },
  ) {
    const pageSize = config.defaultPageSize ?? 50;
    this.oracle = drivers.oracle;
    this.webapi = drivers.webapi;

    this.workorders = new WorkOrdersResource(this.oracle, this.webapi, pageSize);
    this.inventory = new InventoryResource(this.oracle, this.webapi, pageSize);
    this.boms = new BomsResource(this.oracle);
    this.salesOrders = new SalesOrdersResource(this.oracle, pageSize);
    this.purchaseOrders = new PurchaseOrdersResource(this.oracle, pageSize);
    this.schedule = new ScheduleResource(this.oracle, pageSize);
    this.quality = new QualityResource(this.oracle, this.webapi, pageSize);
  }

  /**
   * Build a client with production drivers. Async because the Oracle pool is
   * created eagerly so connection failures surface immediately rather than on
   * the first query.
   */
  static async create(
    config: IqmsConfig,
    overrides: IqmsClientOverrides = {},
  ): Promise<IqmsClient> {
    const oracle = overrides.oracleDriver ?? (await createOracleDriver(config.oracle));
    const webapi =
      overrides.webApiDriver ??
      (config.webapi ? createWebApiDriver(config.webapi) : null);

    return new IqmsClient({ defaultPageSize: config.defaultPageSize }, { oracle, webapi });
  }

  /** Close all underlying drivers. Idempotent. */
  async close(): Promise<void> {
    await Promise.all([this.oracle.close(), this.webapi?.close()].filter(Boolean));
  }
}
