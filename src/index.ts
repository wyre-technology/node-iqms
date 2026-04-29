export { IqmsClient } from './client.js';
export type {
  IqmsConfig,
  OracleConfig,
  WebApiConfig,
} from './config.js';
export * from './errors.js';
export * from './types/index.js';

// Driver interfaces are exported so consumers (and tests) can supply alternate
// implementations — this is how the test suite injects a fake Oracle driver.
export type { OracleDriver, OracleQueryResult } from './drivers/oracle/index.js';
export type { WebApiDriver } from './drivers/webapi/index.js';
