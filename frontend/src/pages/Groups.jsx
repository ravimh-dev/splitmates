import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import CreateGroupModal from "../components/CreateGroupModal";
import JoinGroupModal from "../components/JoinGroupModal";
import { ListSkeleton } from "../components/SkeletonLoader";
import { Users, Plus, UserPlus, Search, ArrowRight } from "lucide-react";

const Groups = () => {
  const { data: groups, isLoading, error } = useGroups();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse"></div>
        </div>
        <ListSkeleton count={4} />
      </div>
    );
  }

  const filteredGroups = groups
    ? groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Groups</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize bills, splitting details, and track payouts for flatmates, trips, and projects.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="inline-flex items-center px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all"
          >
            <UserPlus className="mr-2 h-4.5 w-4.5 text-slate-500" />
            Join with Code
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus className="mr-2 h-4.5 w-4.5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {groups && groups.length > 0 && (
        <div className="w-full max-w-sm relative text-slate-400 focus-within:text-slate-600">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Filter groups by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white placeholder-slate-400 text-sm focus:outline-none focus:border-slate-800 focus:ring-0 transition-colors"
          />
        </div>
      )}

      {/* Main Groups List */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Failed to load groups. Please try refreshing.
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? "No matching groups found" : "No groups found"}
          </h3>
          <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search terms to locate a specific group."
              : "Get started by creating a new expense group or join an existing one using a code."}
          </p>
          {!searchQuery && (
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Create Group
              </button>
              <button
                onClick={() => setIsJoinOpen(true)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
              >
                Join Group
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{group.name}</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 border border-slate-100 bg-slate-50 text-slate-500 rounded-md">
                    CODE: {group.join_code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active member count: {group.member_count || 1}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Created: {new Date(group.created_at).toLocaleDateString()}</span>
                <Link
                  to={`/groups/${group.id}`}
                  className="inline-flex items-center text-xs font-bold text-black hover:underline"
                >
                  Open Group
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default Groups;
