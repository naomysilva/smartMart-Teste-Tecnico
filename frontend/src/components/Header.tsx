import { Package } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
            <Package className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            SMART<span className="text-indigo-600">MART</span>
          </h1>
        </div>

      </div>
    </header>
  );
}
