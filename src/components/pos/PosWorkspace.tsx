"use client";

import { useState } from "react";
import DayReceiptsLog from "@/components/pos/DayReceiptsLog";
import FloorCanvas from "@/components/pos/FloorCanvas";
import KitchenDock from "@/components/pos/KitchenDock";
import PaymentModal from "@/components/pos/PaymentModal";
import PosHeader from "@/components/pos/PosHeader";
import ReceiptModal from "@/components/pos/ReceiptModal";
import TableServicePanel from "@/components/pos/TableServicePanel";
import { usePosWorkspace } from "@/components/pos/usePosWorkspace";

export default function PosWorkspace() {
  const pos = usePosWorkspace();
  const [paymentModalKey, setPaymentModalKey] = useState(0);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 text-zinc-50">
      <PosHeader onResetDemo={pos.handleResetDemo} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
        <FloorCanvas
          sessions={pos.sessions}
          selectedTableId={pos.selectedTableId}
          nowMs={pos.nowMs}
          onSelectTable={pos.handleSelectTable}
          onClearSelection={pos.handleClearTableSelection}
        />

        <TableServicePanel
          hydrated={pos.hydrated}
          selectedTableId={pos.selectedTableId}
          selectedMeta={pos.selectedMeta}
          session={pos.session}
          draft={pos.draft}
          selectedOrders={pos.selectedOrders}
          tabTotal={pos.tabTotal}
          nowMs={pos.nowMs}
          tableHasKitchenWorkload={pos.tableHasKitchenWorkload}
          onAddMeal={pos.handleAddMeal}
          onDecrementMeal={pos.handleDecrementMeal}
          onSubmitOrder={pos.handleSubmitOrder}
          onMarkDelivered={pos.handleMarkDelivered}
          onOpenTicketPreview={() => pos.setTicketOpen(true)}
          onOpenPay={() => {
            setPaymentModalKey((k) => k + 1);
            pos.setPayOpen(true);
          }}
          onClearTableSelection={pos.handleClearTableSelection}
        />
      </div>

      <DayReceiptsLog
        hydrated={pos.hydrated}
        businessDayKey={pos.businessDayKey}
        receipts={pos.dayReceipts}
        grandTotalCents={pos.dayReceiptGrandTotalCents}
      />

      <KitchenDock
        orders={pos.kitchenOrders}
        nowMs={pos.nowMs}
        onDeliver={pos.handleMarkDelivered}
      />

      <ReceiptModal
        open={pos.ticketOpen}
        title="Guest ticket"
        tableLabel={pos.selectedMeta?.label ?? pos.selectedTableId ?? ""}
        orders={pos.tabReceiptOrders}
        onClose={() => pos.setTicketOpen(false)}
      />

      <PaymentModal
        key={paymentModalKey}
        open={pos.payOpen}
        totalCents={pos.tabTotal}
        onClose={() => pos.setPayOpen(false)}
        onPay={(method) => void pos.handlePay(method)}
      />
    </div>
  );
}
