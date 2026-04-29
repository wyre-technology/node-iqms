/**
 * Public type definitions for IQMS / DELMIAworks entities.
 *
 * @remarks
 * **TENTATIVE** — Field names mirror commonly-published EnterpriseIQ table
 * column names but have not been validated against a live tenant. EIQ schema
 * varies across versions (2019/2020/2024). Treat as scaffolding.
 */
export * from './workorders.js';
export * from './inventory.js';
export * from './boms.js';
export * from './sales-orders.js';
export * from './purchase-orders.js';
export * from './schedule.js';
export * from './quality.js';

/** Common pagination shape returned by list methods. */
export interface PaginatedResult<T> {
  items: T[];
  total?: number;
  /** Opaque cursor for next page; undefined when no more results. */
  nextCursor?: string;
}
