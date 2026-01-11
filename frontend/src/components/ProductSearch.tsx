import { Search } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 max-w-sm">
      <Search className="w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none text-sm bg-transparent"
      />
    </div>
  );
}
