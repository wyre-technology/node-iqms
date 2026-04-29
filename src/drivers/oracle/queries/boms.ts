/**
 * TENTATIVE — EnterpriseIQ BOM queries.
 *
 * Primary tables:
 *   bom        — single-level bill of material rows
 *   arinvt     — item master (joined for description)
 */

import type { OracleDriver } from '../index.js';
import type {
  BomExplodeParams,
  BomLine,
  WhereUsedParams,
} from '../../../types/boms.js';

interface BomRow {
  PARENT_ITEM: string;
  COMPONENT_ITEM: string;
  COMPONENT_DESC: string | null;
  QTY_PER: number;
  UOM: string;
  SCRAP_PCT: number | null;
  LVL: number;
}

function mapRow(row: BomRow): BomLine {
  return {
    parentItem: row.PARENT_ITEM,
    componentItem: row.COMPONENT_ITEM,
    componentDescription: row.COMPONENT_DESC ?? undefined,
    quantityPer: row.QTY_PER,
    uom: row.UOM,
    scrapPercent: row.SCRAP_PCT ?? undefined,
    level: row.LVL,
  };
}

export async function explodeBom(
  driver: OracleDriver,
  params: BomExplodeParams,
): Promise<BomLine[]> {
  const maxLevel = params.maxLevel ?? 1;
  const sql = `
    SELECT
      b.parent_item       AS "PARENT_ITEM",
      b.component_item    AS "COMPONENT_ITEM",
      i.description       AS "COMPONENT_DESC",
      b.qty_per           AS "QTY_PER",
      b.uom               AS "UOM",
      b.scrap_percent     AS "SCRAP_PCT",
      LEVEL               AS "LVL"
    FROM bom b
    LEFT JOIN arinvt i ON i.item = b.component_item
    START WITH b.parent_item = :parent
    CONNECT BY PRIOR b.component_item = b.parent_item
       AND LEVEL <= :maxLevel
    ORDER SIBLINGS BY b.component_item
  `;
  const result = await driver.query<BomRow>(sql, {
    parent: params.parentItem,
    maxLevel,
  });
  return result.rows.map(mapRow);
}

export async function whereUsed(
  driver: OracleDriver,
  params: WhereUsedParams,
): Promise<BomLine[]> {
  const maxLevel = params.maxLevel ?? 1;
  const sql = `
    SELECT
      b.parent_item       AS "PARENT_ITEM",
      b.component_item    AS "COMPONENT_ITEM",
      i.description       AS "COMPONENT_DESC",
      b.qty_per           AS "QTY_PER",
      b.uom               AS "UOM",
      b.scrap_percent     AS "SCRAP_PCT",
      LEVEL               AS "LVL"
    FROM bom b
    LEFT JOIN arinvt i ON i.item = b.parent_item
    START WITH b.component_item = :component
    CONNECT BY PRIOR b.parent_item = b.component_item
       AND LEVEL <= :maxLevel
    ORDER SIBLINGS BY b.parent_item
  `;
  const result = await driver.query<BomRow>(sql, {
    component: params.componentItem,
    maxLevel,
  });
  return result.rows.map(mapRow);
}
