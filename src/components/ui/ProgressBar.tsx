interface ProgressBarProps {
  percentage: number
  showLabel?: boolean
  className?: string
}

export default function ProgressBar({ percentage, showLabel = true, className = '' }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100)
  const fillColor =
    percentage >= 100 ? 'bg-danger' : percentage >= 80 ? 'bg-primary' : 'bg-success'

  return (
    <div
      className={['w-full bg-gray-neo border-neo-thick border-dark h-5 relative', className].join(' ')}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${fillColor} h-full transition-all duration-300`}
        style={{ width: `${clamped}%` }}
      />
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
