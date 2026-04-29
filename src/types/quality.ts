/** TENTATIVE — sourced from public EIQ schema references; validate per tenant. */

export type NcrStatus = 'open' | 'investigating' | 'closed';

export interface NonConformance {
  id: number;
  number: string;
  itemNumber?: string;
  workOrderId?: number;
  status: NcrStatus;
  reportedDate: string;
  reportedBy?: string;
  description?: string;
  disposition?: string;
}

export interface NcrListParams {
  status?: NcrStatus;
  itemNumber?: string;
  reportedAfter?: string;
  reportedBefore?: string;
  limit?: number;
  cursor?: string;
}

export interface NcrCreateInput {
  itemNumber?: string;
  workOrderId?: number;
  description: string;
  reportedBy?: string;
}
