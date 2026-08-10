export function FormField({ id, label, error, hint, ...inputProps }) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      <input
        id={id}
        className={`form-field__input${error ? " form-field__input--error" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="form-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
