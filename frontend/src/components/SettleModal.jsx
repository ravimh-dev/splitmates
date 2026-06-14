import React from "react";
import { useCreateSettlement, usePaySettlement } from "../hooks/useSettlements";
import { formatCurrency } from "../utils/format";
import { X, ArrowRight } from "lucide-react";

const SettleModal = ({ isOpen, onClose, settlementInfo, group }) => {
  const createSettlementMutation = useCreateSettlement();
  const paySettlementMutation = usePaySettlement();

  if (!isOpen || !settlementInfo) return null;

  const { fromUserId, fromUserName, toUserId, toUserName, amount } = settlementInfo;

  const handleSettle = async () => {
    try {
      // 1. Create settlement
      const settlement = await createSettlementMutation.mutateAsync({
        groupId: group.id,
        fromUserId,
        toUserId,
        amount,
      });

      // 2. Automatically mark it paid (since it's a manual cash/external recording)
      await paySettlementMutation.mutateAsync(settlement.id);

      onClose();
    } catch (err) {
      console.error("Failed to settle debt:", err);
      alert(err.response?.data?.message || "Failed to record settlement. Try again.");
    }
  };

  const isSubmitting = createSettlementMutation.isPending || paySettlementMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-40">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Record Settlement</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center space-x-6 py-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-center">
              <span className="text-xs text-slate-400 block mb-1">Debtor</span>
              <span className="text-sm font-bold text-slate-800">{fromUserName}</span>
            </div>
            
            <ArrowRight className="h-5 w-5 text-slate-400" />
            
            <div className="text-center">
              <span className="text-xs text-slate-400 block mb-1">Creditor</span>
              <span className="text-sm font-bold text-slate-800">{toUserName}</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Settlement Amount</p>
            <p className="text-3xl font-extrabold text-slate-950">{formatCurrency(amount)}</p>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
            <strong>Note:</strong> Recording this settlement will update everyone's balances and wipe out this debt block in the group balances summary.
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSettle}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettleModal;
