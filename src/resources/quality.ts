import type { OracleDriver } from '../drivers/oracle/index.js';
import type { WebApiDriver } from '../drivers/webapi/index.js';
import { DriverNotConfiguredError } from '../errors.js';
import { listNcrs } from '../drivers/oracle/queries/quality.js';
import type {
  NcrCreateInput,
  NcrListParams,
  NonConformance,
} from '../types/quality.js';

export class QualityResource {
  constructor(
    private readonly oracle: OracleDriver,
    private readonly webapi: WebApiDriver | null,
    private readonly defaultPageSize: number,
  ) {}

  ncrs(params: NcrListParams = {}): Promise<NonConformance[]> {
    return listNcrs(this.oracle, params, this.defaultPageSize);
  }

  async createNcr(input: NcrCreateInput): Promise<NonConformance> {
    if (!this.webapi) throw new DriverNotConfiguredError('webapi', 'quality.createNcr');
    return this.webapi.createNcr(input);
  }
}
