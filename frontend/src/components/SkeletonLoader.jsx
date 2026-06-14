import React from "react";

export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-200 rounded-md"></div>
      <div className="h-8 w-2/3 bg-slate-200 rounded-md"></div>
    </div>
  );
};

export const GroupRowSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-5 w-1/4 bg-slate-200 rounded-md"></div>
        <div className="h-3 w-1/6 bg-slate-200 rounded-md"></div>
      </div>
      <div className="h-8 w-20 bg-slate-200 rounded-xl"></div>
    </div>
  );
};

export const ListSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <GroupRowSkeleton key={index} />
      ))}
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="border border-slate-200 rounded-2xl bg-white p-6 space-y-4 animate-pulse">
      <div className="flex space-x-4 border-b border-slate-100 pb-4">
        <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex space-x-4">
          <div className="h-4 w-1/3 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-1/6 bg-slate-200 rounded-md"></div>
        </div>
      ))}
    </div>
  );
};
