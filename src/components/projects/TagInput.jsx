import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({
  value = [], onChange, placeholder,
  className = 'flex flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-2 focus-within:ring-2 focus-within:ring-ring',
  chipClassName = 'inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary',
  inputClassName = 'min-w-[120px] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground',
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };

  const removeTag = (t) => onChange(value.filter((v) => v !== t));

  return (
    <div className={className}>
      {value.map((t) => (
        <span
          key={t}
          className={chipClassName}
        >
          {t}
          <button
            type="button"
            onClick={() => removeTag(t)}
            className="text-primary/70 hover:text-primary"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
          if (e.key === 'Backspace' && !input && value.length) {
            removeTag(value[value.length - 1]);
          }
        }}
        placeholder={value.length ? '' : placeholder}
        className={inputClassName}
      />
    </div>
  );
}