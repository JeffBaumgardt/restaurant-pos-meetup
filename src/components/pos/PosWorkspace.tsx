"use client";

import FloorCanvas from "@/components/pos/FloorCanvas";
import KitchenDock from "@/components/pos/KitchenDock";
import PaymentModal from "@/components/pos/PaymentModal";
import PosHeader from "@/components/pos/PosHeader";
import ReceiptModal from "@/components/pos/ReceiptModal";
import TableServicePanel from "@/components/pos/TableServicePanel";
import { usePosWorkspace } from "@/components/pos/usePosWorkspace";

export default function PosWorkspace() {
  const pos = usePosWorkspace();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 text-zinc-50">
      <PosHeader onResetDemo={pos.handleResetDemo} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
        <FloorCanvas
          sessions={pos.sessions}
          selectedTableId={pos.selectedTableId}
          nowMs={pos.nowMs}
          onSelectTable={pos.handleSelectTable}
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
          onOpenPay={() => pos.setPayOpen(true)}
        />
      </div>

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
        open={pos.payOpen}
        totalCents={pos.tabTotal}
        onClose={() => pos.setPayOpen(false)}
        onPay={(method) => void pos.handlePay(method)}
      />
    </div>
  );
}
