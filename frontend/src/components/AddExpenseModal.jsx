import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateExpense } from "../hooks/useExpenses";
import { X, Check } from "lucide-react";

const AddExpenseModal = ({ isOpen, onClose, group }) => {
  const createExpenseMutation = useCreateExpense();
  const members = group?.members || [];
  
  const [splitType, setSplitType] = useState("EQUAL");
  const [participants, setParticipants] = useState({}); // { memberId: boolean }
  const [splitValues, setSplitValues] = useState({}); // { memberId: string (value) }
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      paid_by: "",
    },
  });

  const watchAmount = watch("amount");
  const watchPaidBy = watch("paid_by");

  // On mount or group load, set default participants (all members checked)
  useEffect(() => {
    if (members.length > 0) {
      const initialParts = {};
      const initialValues = {};
      members.forEach((m) => {
        initialParts[m.id] = true;
        initialValues[m.id] = "";
      });
      setParticipants(initialParts);
      setSplitValues(initialValues);
      
      // Set default paid_by to first member (or current user if possible)
      setValue("paid_by", members[0].id);
    }
  }, [group, setValue]);

  if (!isOpen) return null;

  const toggleParticipant = (memberId) => {
    setParticipants((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleSplitValueChange = (memberId, value) => {
    // Sanitize input (only allow numbers or decimals depending on split type)
    setSplitValues((prev) => ({
      ...prev,
      [memberId]: value,
    }));
  };

  // Automatically calculate EQUAL shares display
  const totalAmountPaise = Math.round(parseFloat(watchAmount || 0) * 100);
  const activeParticipantsCount = Object.values(participants).filter(Boolean).length;
  const equalSharePaise = activeParticipantsCount > 0 ? Math.floor(totalAmountPaise / activeParticipantsCount) : 0;

  const onSubmit = async (data) => {
    setFormError("");

    const expenseAmountPaise = Math.round(parseFloat(data.amount) * 100);
    if (isNaN(expenseAmountPaise) || expenseAmountPaise <= 0) {
      setFormError("Expense amount must be a positive number.");
      return;
    }

    if (activeParticipantsCount === 0) {
      setFormError("Please select at least one participant to split the expense with.");
      return;
    }

    const selectedMembers = members.filter((m) => participants[m.id]);
    const splits = [];
    let splitSum = 0;

    if (splitType === "EQUAL") {
      // Calculate equal splits, distributing the remainder (in paise) to the first participant
      const baseShare = Math.floor(expenseAmountPaise / activeParticipantsCount);
      const remainder = expenseAmountPaise - baseShare * activeParticipantsCount;

      selectedMembers.forEach((member, index) => {
        const amt = baseShare + (index === 0 ? remainder : 0);
        splits.push({
          user_id: member.id,
          amount: amt,
        });
      });
    } 
    else if (splitType === "EXACT") {
      // Exact split: Validate sum equals total expense
      let inputSumPaise = 0;
      for (const member of selectedMembers) {
        const val = parseFloat(splitValues[member.id] || 0);
        if (isNaN(val) || val < 0) {
          setFormError(`Exact amount for ${member.name} must be a non-negative number.`);
          return;
        }
        const amtPaise = Math.round(val * 100);
        inputSumPaise += amtPaise;
        splits.push({
          user_id: member.id,
          amount: amtPaise,
        });
      }

      if (inputSumPaise !== expenseAmountPaise) {
        setFormError(
          `Sum of split amounts ($${(inputSumPaise / 100).toFixed(2)}) must equal total expense amount ($${data.amount}). Difference: $${Math.abs((expenseAmountPaise - inputSumPaise) / 100).toFixed(2)}`
        );
        return;
      }
    } 
    else if (splitType === "PERCENTAGE") {
      // Percentage split: Validate sum of percentages = 100
      let percentSum = 0;
      for (const member of selectedMembers) {
        const pct = parseFloat(splitValues[member.id] || 0);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          setFormError(`Percentage for ${member.name} must be between 0 and 100.`);
          return;
        }
        percentSum += pct;
      }

      // Allow slight floating point tolerance (e.g. 99.99 to 100.01)
      if (Math.abs(percentSum - 100) > 0.01) {
        setFormError(`Total percentage must equal exactly 100%. Current sum: ${percentSum}%`);
        return;
      }

      // Calculate amounts based on percentage, handling rounding
      let runningSum = 0;
      selectedMembers.forEach((member, index) => {
        const pct = parseFloat(splitValues[member.id] || 0);
        let amtPaise = 0;

        if (index === selectedMembers.length - 1) {
          // Last participant gets the remainder to ensure exact match
          amtPaise = expenseAmountPaise - runningSum;
        } else {
          amtPaise = Math.round((pct / 100) * expenseAmountPaise);
          runningSum += amtPaise;
        }

        splits.push({
          user_id: member.id,
          amount: amtPaise,
          percentage: pct,
        });
      });
    } 
    else if (splitType === "SHARE") {
      // Share split: Allocate dynamically by ratio
      let totalShares = 0;
      for (const member of selectedMembers) {
        const sh = parseInt(splitValues[member.id] || 0, 10);
        if (isNaN(sh) || sh < 0) {
          setFormError(`Shares for ${member.name} must be a non-negative integer.`);
          return;
        }
        totalShares += sh;
      }

      if (totalShares <= 0) {
        setFormError("Total shares must be greater than 0.");
        return;
      }

      // Calculate amounts by share ratio
      let runningSum = 0;
      selectedMembers.forEach((member, index) => {
        const sh = parseInt(splitValues[member.id] || 0, 10);
        let amtPaise = 0;

        if (index === selectedMembers.length - 1) {
          amtPaise = expenseAmountPaise - runningSum;
        } else {
          amtPaise = Math.round((sh / totalShares) * expenseAmountPaise);
          runningSum += amtPaise;
        }

        splits.push({
          user_id: member.id,
          amount: amtPaise,
          shares: sh,
        });
      });
    }

    try {
      await createExpenseMutation.mutateAsync({
        group_id: group.id,
        paid_by: data.paid_by,
        amount: expenseAmountPaise,
        currency: "INR",
        split_type: splitType,
        title: data.title,
        description: data.description,
        splits,
      });

      // Reset states
      reset();
      setSplitType("EQUAL");
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create expense. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-40 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-lg my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900">Add Expense</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
              {formError}
            </div>
          )}

          {/* Core expense details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Expense Title
              </label>
              <input
                id="title"
                type="text"
                disabled={isSubmitting}
                className={`mt-1.5 block w-full px-3 py-2 border rounded-xl focus:outline-none text-sm transition-colors ${
                  errors.title ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-800"
                }`}
                placeholder="e.g. Dinner, Grocery, Fuel"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-700">
                Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                disabled={isSubmitting}
                className={`mt-1.5 block w-full px-3 py-2 border rounded-xl focus:outline-none text-sm transition-colors ${
                  errors.amount ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-800"
                }`}
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be greater than zero" },
                })}
              />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paid_by" className="block text-sm font-semibold text-slate-700">
                Paid By
              </label>
              <select
                id="paid_by"
                disabled={isSubmitting}
                className="mt-1.5 block w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none text-sm"
                {...register("paid_by", { required: "Payer is required" })}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="split_type" className="block text-sm font-semibold text-slate-700">
                Split Type
              </label>
              <select
                id="split_type"
                value={splitType}
                onChange={(e) => {
                  setSplitType(e.target.value);
                  setFormError("");
                }}
                disabled={isSubmitting}
                className="mt-1.5 block w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none text-sm"
              >
                <option value="EQUAL">Equally</option>
                <option value="EXACT">Exact Amounts</option>
                <option value="PERCENTAGE">Percentages</option>
                <option value="SHARE">Shares</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
              Description (Optional)
            </label>
            <input
              id="description"
              type="text"
              disabled={isSubmitting}
              className="mt-1.5 block w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-sm"
              placeholder="Add more details about the bill"
              {...register("description")}
            />
          </div>

          {/* Dynamic Splitting Grid */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Participants Split Config</h4>
            
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 max-h-56 overflow-y-auto">
              {members.map((member) => {
                const isChecked = !!participants[member.id];
                const value = splitValues[member.id] || "";

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between px-4 py-3 bg-white transition-colors ${
                      isChecked ? "" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => toggleParticipant(member.id)}
                        className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked ? "bg-black border-black text-white" : "border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">{member.name}</span>
                        <span className="text-xs text-slate-400 block">{member.email}</span>
                      </div>
                    </div>

                    {/* Dynamic Split Input Box */}
                    {isChecked && (
                      <div className="flex items-center space-x-2">
                        {splitType === "EQUAL" && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            ₹{(equalSharePaise / 100).toFixed(2)}
                          </span>
                        )}

                        {splitType === "EXACT" && (
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={value}
                              onChange={(e) => handleSplitValueChange(member.id, e.target.value)}
                              placeholder="0.00"
                              className="w-24 pl-6 pr-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-800"
                            />
                          </div>
                        )}

                        {splitType === "PERCENTAGE" && (
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={value}
                              onChange={(e) => handleSplitValueChange(member.id, e.target.value)}
                              placeholder="0"
                              className="w-16 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-800 text-right pr-6"
                            />
                            <span className="absolute right-2 top-1 text-xs text-slate-400">%</span>
                          </div>
                        )}

                        {splitType === "SHARE" && (
                          <div className="relative">
                            <input
                              type="number"
                              step="1"
                              value={value}
                              onChange={(e) => handleSplitValueChange(member.id, e.target.value)}
                              placeholder="1"
                              className="w-16 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-800 text-center"
                            />
                            <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">share(s)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
