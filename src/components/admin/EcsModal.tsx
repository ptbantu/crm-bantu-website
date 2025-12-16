/**
 * ECS风格通用弹窗组件
 * 符合阿里云ECS控制台设计语言，支持多种场景（确认、提示、表单、详情）
 */
import { useEffect, useRef, ReactNode } from 'react'
import { X, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { Button, ButtonProps } from '@chakra-ui/react'
import clsx from 'clsx'

export type EcsModalType = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'form'

export interface EcsModalProps {
  // 基础属性
  open: boolean
  onClose: () => void
  title: string
  width?: 'small' | 'medium' | 'large' | 'full' | number

  // 内容类型
  type?: EcsModalType
  icon?: ReactNode // 自定义图标
  message?: string | ReactNode // 简讯内容

  // 操作配置
  showCancel?: boolean
  cancelText?: string
  cancelButtonProps?: ButtonProps
  showConfirm?: boolean
  confirmText?: string
  confirmButtonProps?: ButtonProps
  onConfirm?: () => void | Promise<void> // 确认回调
  showFooter?: boolean // 是否显示底部操作栏
  footer?: ReactNode // 自定义底部

  // 行为控制
  closable?: boolean // 是否显示关闭图标
  maskClosable?: boolean // 点击蒙层是否可关闭
  keyboard?: boolean // 是否支持ESC关闭
  destroyOnClose?: boolean // 关闭时销毁子元素

  // 视觉
  centered?: boolean // 是否垂直居中
  zIndex?: number

  // 内容
  children?: ReactNode

  // 辅助说明（用于表单类型）
  description?: string
}

// 宽度映射
const widthMap = {
  small: '400px',
  medium: '600px',
  large: '800px',
  full: '90vw',
}

// 图标映射
const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  confirm: null,
  form: null,
}

// 图标颜色映射
const iconColorMap = {
  info: '#1890FF',
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
  confirm: undefined,
  form: undefined,
}

const EcsModal = ({
  open,
  onClose,
  title,
  width = 'medium',
  type = 'info',
  icon,
  message,
  showCancel = true,
  cancelText = '取消',
  cancelButtonProps,
  showConfirm = true,
  confirmText = '确定',
  confirmButtonProps,
  onConfirm,
  showFooter = true,
  footer,
  closable = true,
  maskClosable = true,
  keyboard = true,
  destroyOnClose = false,
  centered = true,
  zIndex = 1000,
  children,
  description,
}: EcsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // ESC键关闭
  useEffect(() => {
    if (!keyboard || !open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      // Enter键触发确认
      if (e.key === 'Enter' && onConfirm && showConfirm) {
        // 检查是否在输入框中
        const activeElement = document.activeElement
        if (
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable)
        ) {
          return
        }
        e.preventDefault()
        onConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyboard, open, onClose, onConfirm, showConfirm])

  // 焦点管理
  useEffect(() => {
    if (open && modalRef.current) {
      // 延迟一下，确保动画完成
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      }, 100)
    }
  }, [open])

  // 点击蒙层关闭
  const handleMaskClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose()
    }
  }

  // 处理确认
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    } else {
      onClose()
    }
  }

  // 不显示时返回null
  if (!open && destroyOnClose) {
    return null
  }

  if (!open) {
    return null
  }

  // 获取宽度
  const modalWidth =
    typeof width === 'number' ? `${width}px` : widthMap[width] || widthMap.medium

  // 获取图标
  const IconComponent = iconMap[type]
  const iconColor = iconColorMap[type]
  const showIcon = type !== 'confirm' && type !== 'form' && IconComponent

  // 计算按钮类型
  const getConfirmButtonType = (): ButtonProps => {
    if (confirmButtonProps?.colorScheme) {
      return confirmButtonProps
    }
    // 根据类型设置默认按钮样式
    if (type === 'error' || type === 'confirm') {
      return { colorScheme: 'red', ...confirmButtonProps }
    }
    return { colorScheme: 'blue', ...confirmButtonProps }
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 flex',
        centered ? 'items-center justify-center' : 'items-start justify-center pt-[60px]'
      )}
      style={{
        zIndex,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        animation: open
          ? 'ecsModalFadeIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
          : 'ecsModalFadeOut 0.2s cubic-bezier(0.4, 0, 1, 1)',
      }}
      onClick={handleMaskClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-[4px] shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12)] max-h-[70vh] flex flex-col"
        style={{
          width: modalWidth,
          maxWidth: 'calc(100vw - 48px)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ecs-modal-title"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] flex-shrink-0">
          <h2
            id="ecs-modal-title"
            className={clsx(
              'text-[15px] font-semibold text-[#262626] m-0',
              type === 'confirm' && 'font-semibold'
            )}
          >
            {title}
          </h2>
          {closable && (
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-[#8C8C8C] hover:text-[#262626] transition-colors cursor-pointer bg-transparent border-none p-0"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 内容区 */}
        <div
          ref={contentRef}
          className="px-6 py-5 flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(70vh - 120px)' }}
        >
          {/* 提示类型：显示图标和消息 */}
          {type !== 'form' && message && (
            <div className="flex items-start gap-4">
              {showIcon && IconComponent && (
                <div className="flex-shrink-0 mt-0.5">
                  <IconComponent size={22} style={{ color: iconColor }} />
                </div>
              )}
              {icon && !showIcon && (
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
              )}
              <div className="flex-1">
                {typeof message === 'string' ? (
                  <p className="text-[13px] text-[#595959] leading-[1.5] m-0">
                    {message}
                  </p>
                ) : (
                  message
                )}
              </div>
            </div>
          )}

          {/* 表单类型：显示描述和表单内容 */}
          {type === 'form' && (
            <div>
              {description && (
                <p className="text-[12px] text-[#8C8C8C] mb-4 leading-[1.5]">
                  {description}
                </p>
              )}
              {children}
            </div>
          )}

          {/* 自定义内容（详情展示等） */}
          {!message && type !== 'form' && children && (
            <div>{children}</div>
          )}
        </div>

        {/* 操作栏 */}
        {showFooter && (
          <div className="px-6 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA] flex items-center justify-end gap-2 flex-shrink-0">
            {footer ? (
              footer
            ) : (
              <>
                {showCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    {...cancelButtonProps}
                    className="text-[13px]"
                  >
                    {cancelText}
                  </Button>
                )}
                {showConfirm && (
                  <Button
                    ref={confirmButtonRef}
                    size="sm"
                    onClick={handleConfirm}
                    {...getConfirmButtonType()}
                    className="text-[13px]"
                  >
                    {confirmText}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes ecsModalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ecsModalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes ecsModalSlideIn {
          from {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes ecsModalSlideOut {
          from {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          to {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
          }
        }

        /* 响应式 */
        @media (max-width: 768px) {
          .ecs-modal-container {
            width: 90vw !important;
            margin: 0 5vw;
          }
        }
      `}</style>
    </div>
  )
}

export default EcsModal
