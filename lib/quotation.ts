// Shared math for the room-wise Quotation generator.
// Line amounts are entered directly (no rate column, matching the printed format);
// some lines carry a text note ("By builder", "On Actuals", "TBD") instead of a number.

export type QuotationItemLike = { amount: number | null };

export type QuotationTotals = {
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
};

export function computeQuotationTotals(items: QuotationItemLike[], discountPct: number): QuotationTotals {
  const totalAmount = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const discountAmount = totalAmount * (discountPct / 100);
  const finalAmount = totalAmount - discountAmount;
  return { totalAmount, discountAmount, finalAmount };
}

export function nextQuotationNumber(existingCount: number) {
  return `QT-${1000 + existingCount + 1}`;
}

// Marks each item with whether its room label should be printed — the first row
// of each consecutive run of same-room items shows the name, the rest leave it
// blank, matching the merged-cell look of the reference document.
export function groupByRoom<T extends { room: string }>(items: T[]): (T & { showRoom: boolean })[] {
  let lastRoom: string | null = null;
  return items.map((item) => {
    const showRoom = item.room !== lastRoom;
    lastRoom = item.room;
    return { ...item, showRoom };
  });
}
