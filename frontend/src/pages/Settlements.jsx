import React, { useState } from "react";
import { useGroups } from "../hooks/useGroups";
import { useGroupSettlements, usePaySettlement } from "../hooks/useSettlements";
import { formatCurrency, formatDate } from "../utils/format";
import { CreditCard, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

const Settlements = () => {
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState("");
  
  const { data: settlements, isLoading: settlementsLoading } = useGroupSettlements(selectedGroupId);
  const paySettlementMutation = usePaySettlement();

  const handlePay = async (settlementId) => {
    try {
      await paySettlementMutation.mutateAsync(settlementId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark settlement as paid");
    }
  };

  const selectedGroup = groups?.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Group Settlements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, pay, and track payments recorded across your different groups.
        </p>
      </div>

      {/* Select Group Dropdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <label htmlFor="group-select" className="block text-sm font-semibold text-slate-700">
          Select Group to View Settlements
        </label>
        
        {groupsLoading ? (
          <div className="h-10 w-full max-w-xs bg-slate-100 rounded-xl animate-pulse"></div>
        ) : !groups || groups.length === 0 ? (
          <div className="text-sm text-slate-400">
            You don't belong to any groups yet. Create or join a group first to manage settlements.
          </div>
        ) : (
          <select
            id="group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="block w-full max-w-xs px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-slate-800"
          >
            <option value="">-- Choose a Group --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Settlements List */}
      {!selectedGroupId ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">Select a group</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Choose a group from the list above to view its balance payments and settle transactions.
          </p>
        </div>
      ) : settlementsLoading ? (
        <div className="space-y-4">
          <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse"></div>
          <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
      ) : !settlements || settlements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">No settlements found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            No settlements have been recorded in the group <strong>{selectedGroup?.name}</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settlements.map((s) => {
            const fromUser = selectedGroup?.members?.find((m) => m.id === s.from_user_id)?.name || "Debtor";
            const toUser = selectedGroup?.members?.find((m) => m.id === s.to_user_id)?.name || "Creditor";
            const isCompleted = s.status === "COMPLETED";

            return (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Settlement transaction
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-1">
                      {fromUser} &rarr; {toUser}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">{formatCurrency(s.amount)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    }`}>
                      {isCompleted ? "Paid" : "Pending Approval"}
                    </span>
                    
                    {isCompleted && s.settled_at && (
                      <span className="text-[10px] text-slate-400 block mt-1.5">
                        Cleared on: {formatDate(s.settled_at)}
                      </span>
                    )}
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handlePay(s.id)}
                      disabled={paySettlementMutation.isPending}
                      className="px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:bg-slate-400"
                    >
                      {paySettlementMutation.isPending ? "Updating..." : "Mark Completed"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Settlements;
