import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Purchase, PurchaseStatus } from '@/types';

const STATUS_LABEL: Record<string, PurchaseStatus> = {
  pending: 'Đang giao',
  received: 'Đã nhập',
  cancelled: 'Đang giao',
};

type RawPurchase = {
  id: string;
  code: string;
  status: string;
  total: number;
  payment_method: string;
  created_at: string;
  supplier: { name: string } | null;
  items: { quantity: number }[];
};

function mapPurchase(r: RawPurchase): Purchase & { rowId: string } {
  return {
    rowId: r.id,
    id: r.code,
    time: new Date(r.created_at).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }),
    supplier: r.supplier?.name ?? '—',
    items: r.items.reduce((s, i) => s + i.quantity, 0),
    total: Number(r.total),
    status: STATUS_LABEL[r.status] ?? 'Đang giao',
  };
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, phone, address, note')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; phone?: string; address?: string; note?: string }) => {
      const { data, error } = await supabase.from('suppliers').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export interface PurchasesOptions {
  page?: number;
  pageSize?: number;
}

export function usePurchases(opts: PurchasesOptions = {}) {
  const { page = 1, pageSize = 20 } = opts;
  return useQuery({
    queryKey: ['purchases', { page, pageSize }],
    queryFn: async (): Promise<{ rows: (Purchase & { rowId: string })[]; total: number }> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('purchases')
        .select(
          'id, code, status, total, payment_method, created_at, supplier:suppliers(name), items:purchase_items(quantity)',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        rows: (data as unknown as RawPurchase[]).map(mapPurchase),
        total: count ?? 0,
      };
    },
  });
}

export function usePurchase(id: string | undefined) {
  return useQuery({
    queryKey: ['purchases', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, supplier:suppliers(*), items:purchase_items(*, product:products(id, name, sku, unit))')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export interface PurchaseLineDraft {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseDraft {
  supplierId: string | null;
  supplierName?: string;
  invoiceNumber?: string;
  paymentMethod: 'paid' | 'debt_30d' | 'installment';
  note?: string;
  lines: PurchaseLineDraft[];
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draft: CreatePurchaseDraft) => {
      const total = draft.lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);
      const { data: po, error: poErr } = await supabase
        .from('purchases')
        .insert({
          code: 'NH-TMP',
          supplier_id: draft.supplierId,
          invoice_number: draft.invoiceNumber || null,
          payment_method: draft.paymentMethod,
          note: draft.note || null,
          total,
        })
        .select()
        .single();
      if (poErr) throw poErr;
      const items = draft.lines.map((l) => ({
        purchase_id: po.id,
        product_id: l.productId,
        quantity: l.quantity,
        unit_cost: l.unitCost,
        subtotal: l.quantity * l.unitCost,
      }));
      const { error: itemsErr } = await supabase.from('purchase_items').insert(items);
      if (itemsErr) throw itemsErr;
      return po;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}

export function useReceivePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ purchaseId, updateCost = false }: { purchaseId: string; updateCost?: boolean }) => {
      const { error } = await supabase.rpc('receive_purchase', {
        p_purchase_id: purchaseId,
        p_update_cost: updateCost,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
