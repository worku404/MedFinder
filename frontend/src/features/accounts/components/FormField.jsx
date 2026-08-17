export function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold tracking-wide text-[#304744]"
      >
        {label}
        {required && (
          <span className="ml-1 text-[#b3503f]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className="
            w-full
            h-12
            rounded-xl
            border
            border-[#cbdcda]
            bg-[rgba(248,253,253,0.78)]
            px-4
            text-sm
            font-medium
            text-[#0e1b1a]
            placeholder:text-[#8a9c99]
            outline-none
            shadow-[0_2px_8px_rgba(14,27,26,0.04)]
            transition-all
            duration-200
            hover:border-[#a9c5c2]
            hover:bg-[rgba(255,255,255,0.9)]
            focus:border-[#0e8a82]
            focus:bg-white
            focus:ring-4
            focus:ring-[rgba(14,138,130,0.12)]
            focus:shadow-[0_4px_14px_rgba(14,138,130,0.08)]
            disabled:cursor-not-allowed
            disabled:bg-[#e2ebe9]
            disabled:opacity-60
          "
        />
      </div>
    </div>
  );
}
