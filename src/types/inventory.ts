/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export interface InventoryOnHand {
  itemNumber: string;
  itemDescription?: string;
  location: string;
  lotNumber?: string;
  quantityOnHand: number;
  uom: string;
}

export interface InventoryOnHandParams {
  itemNumber?: string;
  location?: string;
  lotNumber?: string;
  /** Hide rows with zero on-hand quantity. Defaults to true. */
  hideZeroOnHand?: boolean;
  limit?: number;
  cursor?: string;
}

export interface LotTraceParams {
  lotNumber: string;
  /** "where_produced" walks consumption forward; "from_components" walks back. */
  direction?: 'where_produced' | 'from_components';
}

export interface LotTraceNode {
  lotNumber: string;
  itemNumber: string;
  quantity: number;
  uom: string;
  parentLotNumber?: string;
  workOrderId?: number;
}

export interface InventoryAdjustmentInput {
  itemNumber: string;
  location: string;
  lotNumber?: string;
  quantityDelta: number;
  reasonCode: string;
  notes?: string;
}
