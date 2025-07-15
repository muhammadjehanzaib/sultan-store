// src/components/ui/RiyalSymbol.tsx
export function RiyalSymbol({ className = 'w-5 h-5 inline-block align-text-bottom' }) {
  return (
    <img
      src="/icons/riyal.svg"
      alt="Saudi Riyal"
      className={className}
      style={{ display: 'inline', verticalAlign: 'middle' }}
      loading="lazy"
    />
  );
} 