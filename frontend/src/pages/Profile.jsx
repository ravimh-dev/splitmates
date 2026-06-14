import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../api/auth";
import { User, LogOut, CheckCircle, AlertCircle } from "lucide-react";

const Profile = () => {
  const { user, logout, updateProfileState } = useAuth();
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      avatar_url: user?.avatar_url || "",
    },
  });

  const onSubmit = async (data) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const updated = await updateProfile({
        name: data.name,
        avatar_url: data.avatar_url,
      });
      // Update local state in AuthContext so UI re-renders user info everywhere
      updateProfileState(updated);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile. Try again.");
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, avatar image, and session settings.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-800 overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t border-slate-100">
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              disabled={isSubmitting}
              className={`mt-1.5 block w-full px-3 py-2.5 border rounded-xl shadow-none focus:outline-none text-sm transition-colors ${
                errors.name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-800"
              }`}
              placeholder="e.g. Ravi Kumar"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="avatar_url" className="block text-sm font-semibold text-slate-700">
              Avatar Image URL
            </label>
            <input
              id="avatar_url"
              type="text"
              disabled={isSubmitting}
              className="mt-1.5 block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none text-sm transition-colors focus:border-slate-800"
              placeholder="e.g. https://images.unsplash.com/... or leave blank"
              {...register("avatar_url")}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Logout Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sign Out</h3>
          <p className="text-xs text-slate-400 mt-1">End your current session on this device.</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-all"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
