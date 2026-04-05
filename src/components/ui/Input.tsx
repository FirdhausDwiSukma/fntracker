import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="font-bold text-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full border-neo-thick px-3 py-2 bg-light font-medium',
            'focus:outline-none focus:shadow-neo',
            'placeholder:text-gray-400',
            error ? 'border-danger' : 'border-dark',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-danger text-sm font-bold">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
