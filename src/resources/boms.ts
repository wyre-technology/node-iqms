import type { OracleDriver } from '../drivers/oracle/index.js';
import { explodeBom, whereUsed } from '../drivers/oracle/queries/boms.js';
import type { BomExplodeParams, BomLine, WhereUsedParams } from '../types/boms.js';

export class BomsResource {
  constructor(private readonly oracle: OracleDriver) {}

  explode(params: BomExplodeParams): Promise<BomLine[]> {
    return explodeBom(this.oracle, params);
  }

  whereUsed(params: WhereUsedParams): Promise<BomLine[]> {
    return whereUsed(this.oracle, params);
  }
}
