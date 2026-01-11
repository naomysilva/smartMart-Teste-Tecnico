interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button = ({ children, onClick, className = "" }: ButtonProps) => (
  <button onClick={onClick} className={`py-3 px-4 font-bold rounded-xl shadow-md transition-all active:scale-95 ${className}`}>
    {children}
  </button>
);
