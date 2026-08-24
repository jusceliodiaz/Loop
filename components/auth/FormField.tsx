import type { InputHTMLAttributes, ReactNode } from "react";

export function FormField({
  id,
  label,
  icon,
  ...inputProps
}: {
  id: string;
  label: string;
  icon: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] text-text-3">
        {label}
      </label>
      <div className="group relative flex items-center">
        <span className="pointer-events-none absolute left-3 flex h-4 w-4 items-center justify-center text-text-3 transition-colors group-focus-within:text-text-1">
          {icon}
        </span>
        <input
          id={id}
          className="w-full rounded-[10px] border border-stroke bg-glass-1 px-3 py-2.5 pl-10 text-[14.5px] text-text-1 transition-colors placeholder:text-text-3"
          {...inputProps}
        />
      </div>
    </div>
  );
}
