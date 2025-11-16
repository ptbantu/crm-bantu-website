import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const Toast = ({ id, type, message, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 触发进入动画
    setTimeout(() => setIsVisible(true), 10)

    // 自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // 等待动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const icon = type === 'success' ? CheckCircle2 : XCircle
  const Icon = icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 min-w-[320px] max-w-[420px] p-4 rounded-xl shadow-lg border transition-all duration-300 transform',
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800',
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', type === 'success' ? 'text-green-600' : 'text-red-600')} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className={cn(
          'p-1 rounded-lg hover:bg-opacity-20 transition-colors flex-shrink-0',
          type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600'
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast

