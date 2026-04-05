import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

type ToastVariant = 'success' | 'error' | 'warning'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-success text-light',
  error:   'bg-danger text-light',
  warning: 'bg-primary text-dark',
}

let nextId = 0

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), 4000)
    return () => clearTimeout(timer)
  }, [item.id, onRemove])

  return (
    <div
      role="alert"
      className={[
        'flex items-center justify-between gap-4',
        'border-neo-thick border-dark shadow-neo',
        'px-4 py-3 font-bold text-sm min-w-[260px] max-w-sm',
        variantClasses[item.variant],
      ].join(' ')}
    >
      <span>{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Dismiss"
        className="font-black text-lg leading-none opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
