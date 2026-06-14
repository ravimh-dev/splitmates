import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyBalances } from "../hooks/useBalances";
import { useGroups } from "../hooks/useGroups";
import { formatCurrency } from "../utils/format";
import { CardSkeleton } from "../components/SkeletonLoader";
import CreateGroupModal from "../components/CreateGroupModal";
import JoinGroupModal from "../components/JoinGroupModal";
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const { data: myBalances, isLoading: balancesLoading } = useMyBalances();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const activeGroupsCount = groups ? groups.length : 0;

  if (balancesLoading || groupsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-72 bg-slate-200 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Calculate balance colors
  const balanceVal = myBalances?.net_balance ?? 0;
  const lentVal = myBalances?.total_paid ?? 0;
  const owedVal = myBalances?.total_owed ?? 0;

  const isNetOwed = balanceVal < 0;
  const isNetLent = balanceVal > 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your shared expenses, lendings, and debts across all active groups.
          </p>
        </div>

        {/* Quick actions in header */}
        <div className="flex space-x-3">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="inline-flex items-center px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all"
          >
            <UserPlus className="mr-2 h-4.5 w-4.5 text-slate-500" />
            Join Group
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus className="mr-2 h-4.5 w-4.5" />
            New Group
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Balance</span>
            <div className={`p-2 rounded-xl border ${
              isNetLent
                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                : isNetOwed
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-slate-50 border-slate-100 text-slate-600"
            }`}>
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold tracking-tight ${
              isNetLent ? "text-emerald-600" : isNetOwed ? "text-red-600" : "text-slate-900"
            }`}>
              {formatCurrency(balanceVal)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isNetLent ? "You are owed overall" : isNetOwed ? "You owe overall" : "You are completely settled"}
            </p>
          </div>
        </div>

        {/* Total Lent Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Lent (Paid)</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(lentVal)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Total amount you paid for others</p>
          </div>
        </div>

        {/* Total Owed Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Owed</span>
            <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-600">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(owedVal)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Total share you owe to others</p>
          </div>
        </div>

        {/* Active Groups Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active Groups</span>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{activeGroupsCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Groups you share expenses with</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Active Groups & Activities) | Right Column (Placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Core App Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Groups Listing */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Your Active Groups</h2>
              <Link to="/groups" className="text-xs font-semibold text-slate-500 hover:text-black">
                View all
              </Link>
            </div>
            
            {activeGroupsCount === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">No active groups yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Create a new group or join one using a join code to get started.
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => setIsJoinOpen(true)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                  >
                    Join Group
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {groups.slice(0, 5).map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="block px-6 py-4.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{group.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {group.member_count} members • Code: <span className="font-mono font-semibold uppercase">{group.join_code}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-slate-400 border border-slate-100 bg-slate-50 px-2.5 py-1 rounded-full">
                          Open Group
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>


        </div>

        {/* Right Column - Premium SaaS Placeholders */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-center transition-colors group"
              >
                <Plus className="h-6 w-6 text-slate-500 group-hover:text-black mb-2" />
                <span className="text-xs font-semibold text-slate-700">New Group</span>
              </button>
              <button
                onClick={() => setIsJoinOpen(true)}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-center transition-colors group"
              >
                <UserPlus className="h-6 w-6 text-slate-500 group-hover:text-black mb-2" />
                <span className="text-xs font-semibold text-slate-700">Join Group</span>
              </button>
            </div>
          </div>


        </div>
        
      </div>

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};

export default Dashboard;
