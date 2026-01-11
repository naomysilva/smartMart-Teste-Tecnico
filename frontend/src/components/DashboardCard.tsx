import type { JSX } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: JSX.Element;
  bgColor?: string;
  textColor?: string;
}

export function DashboardCard({ title, value, icon, bgColor="bg-white", textColor="text-slate-900" }: DashboardCardProps) {
  return (
    <div className={`${bgColor} p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02] ${textColor}`}>
      <div className="bg-slate-100 p-4 rounded-2xl text-indigo-600">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
