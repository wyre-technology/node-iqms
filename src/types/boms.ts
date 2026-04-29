/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export interface BomLine {
  parentItem: string;
  componentItem: string;
  componentDescription?: string;
  quantityPer: number;
  uom: string;
  scrapPercent?: number;
  level?: number;
}

export interface BomExplodeParams {
  parentItem: string;
  /** Maximum levels to explode. Defaults to 1 (single level). */
  maxLevel?: number;
}

export interface WhereUsedParams {
  componentItem: string;
  /** Maximum levels to walk up. Defaults to 1. */
  maxLevel?: number;
}
