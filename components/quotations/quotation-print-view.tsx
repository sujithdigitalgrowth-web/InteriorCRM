import { Compass } from "lucide-react";
import { groupByRoom, type QuotationTotals } from "@/lib/quotation";
import { formatDate } from "@/lib/utils";
import type { Quotation, QuotationItem, Client, Project, Settings } from "@prisma/client";

type FullQuotation = Quotation & {
  items: QuotationItem[];
  client: Client;
  project: Project;
};

function plainNumber(value: number) {
  return Math.round(value).toString();
}

export function QuotationPrintView({
  quotation,
  settings,
  totals,
}: {
  quotation: FullQuotation;
  settings: Settings;
  totals: QuotationTotals;
}) {
  const rows = groupByRoom(quotation.items);

  return (
    <div className="hidden print:block" style={{ color: "#1a1a1a", fontSize: "11px" }}>
      <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: "#6e2a21" }}>
        {settings.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logoUrl} alt={settings.businessName} style={{ height: 48, objectFit: "contain" }} />
        ) : (
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ height: 48, width: 48, background: "#6e2a21", color: "#fff" }}
          >
            <Compass size={24} />
          </div>
        )}
        <div className="text-right">
          <p className="text-lg font-bold uppercase tracking-wide" style={{ color: "#6e2a21" }}>
            {settings.businessName}
          </p>
          {settings.tagline && <p className="text-xs uppercase tracking-widest text-gray-500">{settings.tagline}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-base font-bold" style={{ color: "#6e2a21" }}>
          Quotation:
        </h1>
        <div className="text-right text-xs text-gray-600">
          <p>{quotation.quotationNumber}</p>
          <p>{formatDate(quotation.createdAt)}</p>
        </div>
      </div>

      {quotation.title && <p className="mt-1 text-sm font-medium">{quotation.title}</p>}
      <p className="mt-1 text-xs text-gray-600">
        {quotation.project.name} · {quotation.client.name}
      </p>

      <table className="mt-4 w-full border-collapse text-left" style={{ fontSize: "10px" }}>
        <thead>
          <tr>
            {["Room", "Description", "Dimensions L x B", "Covered Area(sft/qty)", "Final Total"].map((h) => (
              <th key={h} className="border px-2 py-1.5 font-semibold" style={{ borderColor: "#999" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="border px-2 py-1 align-top font-medium" style={{ borderColor: "#999" }}>
                {item.showRoom ? item.room : ""}
              </td>
              <td className="border px-2 py-1 align-top" style={{ borderColor: "#999" }}>
                {item.description}
              </td>
              <td className="border px-2 py-1 text-center align-top" style={{ borderColor: "#999" }}>
                {item.lengthFt != null && item.breadthFt != null ? `${item.lengthFt} X ${item.breadthFt}` : ""}
              </td>
              <td className="border px-2 py-1 text-center align-top" style={{ borderColor: "#999" }}>
                {item.areaOrQty != null ? item.areaOrQty.toFixed(2) : ""}
              </td>
              <td className="border px-2 py-1 text-right align-top" style={{ borderColor: "#999" }}>
                {item.amount != null ? plainNumber(item.amount) : <em>{item.amountNote}</em>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: "#f0a860" }}>
            <td colSpan={4} className="border px-2 py-1.5 text-right font-semibold" style={{ borderColor: "#999" }}>
              Total Amount
            </td>
            <td className="border px-2 py-1.5 text-right font-semibold" style={{ borderColor: "#999" }}>
              {plainNumber(totals.totalAmount)}
            </td>
          </tr>
          {quotation.discountPct > 0 && (
            <tr style={{ background: "#f0a860" }}>
              <td colSpan={4} className="border px-2 py-1.5 text-right font-semibold" style={{ borderColor: "#999" }}>
                {quotation.discountLabel || `Discount ${quotation.discountPct}%`}
              </td>
              <td className="border px-2 py-1.5 text-right font-semibold" style={{ borderColor: "#999" }}>
                {plainNumber(totals.discountAmount)}
              </td>
            </tr>
          )}
          <tr style={{ background: "#e88a3a" }}>
            <td colSpan={4} className="border px-2 py-1.5 text-right font-bold" style={{ borderColor: "#999" }}>
              Final Amount
            </td>
            <td className="border px-2 py-1.5 text-right font-bold" style={{ borderColor: "#999" }}>
              {plainNumber(totals.finalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 border-t pt-3 text-center text-[10px] text-gray-500" style={{ borderColor: "#ccc" }}>
        <p className="font-semibold">{settings.businessName.toUpperCase()}</p>
        {settings.address && <p>{settings.address}</p>}
        <p>
          {[settings.phone, settings.website].filter(Boolean).join("  |  ")}
        </p>
      </div>
    </div>
  );
}
