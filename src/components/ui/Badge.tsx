type BadgeVariant = 'income' | 'expense' | 'warning' | 'exceeded'

interface BadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  income:   'bg-success text-light',
  expense:  'bg-danger text-light',
  warning:  'bg-primary text-dark',
  exceeded: 'bg-danger text-light',
}

const defaultLabels: Record<BadgeVariant, string> = {
  income:   'Income',
  expense:  'Expense',
  warning:  'Warning',
  exceeded: 'Exceeded',
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5',
        'border-neo border-dark font-black text-xs uppercase tracking-wide',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children ?? defaultLabels[variant]}
    </span>
  )
}
