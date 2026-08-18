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
  error,
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
            auth-form-field

            w-full
            h-12
            rounded-xl
            border

            px-4

            text-sm
            font-medium

            outline-none

            transition-all
            duration-200

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />
      </div>

      {/* Error */}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
