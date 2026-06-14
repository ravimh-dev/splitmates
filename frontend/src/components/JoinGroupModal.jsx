import React from "react";
import { useForm } from "react-hook-form";
import { useJoinGroup } from "../hooks/useGroups";
import { X } from "lucide-react";

const JoinGroupModal = ({ isOpen, onClose }) => {
  const joinGroupMutation = useJoinGroup();
  
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      joinCode: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await joinGroupMutation.mutateAsync({ joinCode: data.joinCode });
      reset();
      onClose();
    } catch (err) {
      setError("joinCode", {
        type: "server",
        message: err.response?.data?.message || "Invalid join code. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-40">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Join Group</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="joinCode" className="block text-sm font-semibold text-slate-700">
              Join Code
            </label>
            <input
              id="joinCode"
              type="text"
              disabled={isSubmitting}
              className={`mt-1.5 block w-full px-3 py-2.5 border rounded-xl shadow-none placeholder-slate-400 focus:outline-none text-sm transition-colors uppercase ${
                errors.joinCode
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-slate-800"
              }`}
              placeholder="e.g. AB12CD"
              maxLength={6}
              {...register("joinCode", {
                required: "Join code is required",
                minLength: {
                  value: 6,
                  message: "Join code must be exactly 6 characters",
                },
                maxLength: {
                  value: 6,
                  message: "Join code must be exactly 6 characters",
                },
              })}
            />
            {errors.joinCode && (
              <p className="mt-1.5 text-xs text-red-600">{errors.joinCode.message}</p>
            )}
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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Joining..." : "Join Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
