# EcsModal 组件使用文档

符合阿里云ECS控制台设计语言的通用弹窗组件。

## 安装与导入

```tsx
import EcsModal from '@/components/admin/EcsModal'
// 或
import { EcsModal } from '@/components/admin'
```

## 基础用法

### 1. 信息提示

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="提示信息"
  type="info"
  message="这是一条信息提示。"
  showCancel={false}
  confirmText="知道了"
/>
```

### 2. 成功提示

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="操作成功"
  type="success"
  message="供应商信息已更新成功。"
  showCancel={false}
  confirmText="知道了"
/>
```

### 3. 警告提示

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="警告"
  type="warning"
  message="此操作可能会影响系统性能，请谨慎操作。"
/>
```

### 4. 错误提示

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="操作失败"
  type="error"
  message="网络连接失败，请检查您的网络设置后重试。"
/>
```

### 5. 确认对话框

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="确认删除"
  type="confirm"
  message="确定要删除这个供应商吗？此操作不可撤销。"
  confirmText="删除"
  confirmButtonProps={{ colorScheme: 'red' }}
  onConfirm={async () => {
    // 执行删除操作
    await deleteItem()
    setIsOpen(false)
  }}
/>
```

### 6. 表单弹窗

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="编辑组织信息"
  width="large"
  type="form"
  description="请填写以下信息，带 * 号的为必填项。"
  onConfirm={async () => {
    // 表单提交逻辑
    await submitForm()
    setIsOpen(false)
  }}
>
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        组织名称 <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  </div>
</EcsModal>
```

### 7. 详情展示弹窗

```tsx
<EcsModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="组织详情"
  width="large"
  showFooter={false}
>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        组织名称
      </label>
      <div className="text-sm text-gray-900">示例组织</div>
    </div>
  </div>
</EcsModal>
```

## API 参数

### EcsModalProps

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| open | 是否显示弹窗 | `boolean` | - |
| onClose | 关闭回调 | `() => void` | - |
| title | 标题 | `string` | - |
| width | 宽度 | `'small' \| 'medium' \| 'large' \| 'full' \| number` | `'medium'` |
| type | 弹窗类型 | `'info' \| 'success' \| 'warning' \| 'error' \| 'confirm' \| 'form'` | `'info'` |
| icon | 自定义图标 | `ReactNode` | - |
| message | 提示消息 | `string \| ReactNode` | - |
| showCancel | 是否显示取消按钮 | `boolean` | `true` |
| cancelText | 取消按钮文字 | `string` | `'取消'` |
| cancelButtonProps | 取消按钮属性 | `ButtonProps` | - |
| showConfirm | 是否显示确认按钮 | `boolean` | `true` |
| confirmText | 确认按钮文字 | `string` | `'确定'` |
| confirmButtonProps | 确认按钮属性 | `ButtonProps` | - |
| onConfirm | 确认回调 | `() => void \| Promise<void>` | - |
| showFooter | 是否显示底部操作栏 | `boolean` | `true` |
| footer | 自定义底部 | `ReactNode` | - |
| closable | 是否显示关闭图标 | `boolean` | `true` |
| maskClosable | 点击蒙层是否可关闭 | `boolean` | `true` |
| keyboard | 是否支持ESC关闭 | `boolean` | `true` |
| destroyOnClose | 关闭时销毁子元素 | `boolean` | `false` |
| centered | 是否垂直居中 | `boolean` | `true` |
| zIndex | 层级 | `number` | `1000` |
| children | 自定义内容 | `ReactNode` | - |
| description | 辅助说明（用于表单类型） | `string` | - |

## 宽度预设

- `small`: 400px
- `medium`: 600px
- `large`: 800px
- `full`: 90vw
- 数字: 自定义像素值

## 设计规范

### 颜色规范
- 信息：`#1890FF`
- 成功：`#52C41A`
- 警告：`#FAAD14`
- 错误：`#FF4D4F`

### 字体规范
- 标题：`15px`，`Semibold`，`#262626`
- 正文：`13px`，`Regular`，`#595959`
- 辅助文字：`12px`，`#8C8C8C`

### 间距规范
- 标题栏内边距：`16px 24px`
- 内容区内边距：`20px 24px`
- 操作栏内边距：`12px 24px`

## 响应式

在屏幕宽度 `< 768px` 时，弹窗宽度自动调整为 `90vw`，左右边距 `5vw`。

## 键盘支持

- `ESC`: 关闭弹窗
- `Enter`: 触发确认操作（不在输入框中时）

## 无障碍支持

组件已内置 ARIA 属性，支持屏幕阅读器。
