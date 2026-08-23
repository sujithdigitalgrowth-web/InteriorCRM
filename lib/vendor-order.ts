// Shared math for vendor purchase-order line items: rate x qty, less discount, plus GST.

export type VendorOrderItemLike = {
  rate: number;
  quantity: number;
  discountPct: number;
  gstPct: number;
};

export type VendorOrderLineTotals = {
  withoutGst: number;
  gstAmount: number;
  withGst: number;
};

export function computeLineTotals(item: VendorOrderItemLike): VendorOrderLineTotals {
  const gross = item.rate * item.quantity;
  const withoutGst = gross * (1 - item.discountPct / 100);
  const gstAmount = withoutGst * (item.gstPct / 100);
  const withGst = withoutGst + gstAmount;
  return { withoutGst, gstAmount, withGst };
}

export function sumLineTotals(items: VendorOrderItemLike[]): VendorOrderLineTotals {
  return items.reduce(
    (acc, item) => {
      const t = computeLineTotals(item);
      return {
        withoutGst: acc.withoutGst + t.withoutGst,
        gstAmount: acc.gstAmount + t.gstAmount,
        withGst: acc.withGst + t.withGst,
      };
    },
    { withoutGst: 0, gstAmount: 0, withGst: 0 }
  );
}

export const VENDOR_ORDER_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "TRANSPORT", label: "Transport" },
  { value: "LABOR", label: "Labor" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];
