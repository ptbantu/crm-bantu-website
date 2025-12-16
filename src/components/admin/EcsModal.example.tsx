/**
 * EcsModal 使用示例
 * 展示各种场景下的使用方法
 */
import { useState } from 'react'
import EcsModal from './EcsModal'
import { Button } from '@chakra-ui/react'

const EcsModalExamples = () => {
  const [infoOpen, setInfoOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">EcsModal 使用示例</h1>

      {/* 示例1：信息提示 */}
      <div>
        <Button onClick={() => setInfoOpen(true)}>打开信息提示</Button>
        <EcsModal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title="提示信息"
          type="info"
          message="这是一条信息提示，用于告知用户某些信息。"
          showCancel={false}
          confirmText="知道了"
        />
      </div>

      {/* 示例2：成功提示 */}
      <div>
        <Button onClick={() => setSuccessOpen(true)}>打开成功提示</Button>
        <EcsModal
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="操作成功"
          type="success"
          message="供应商信息已更新成功。"
          showCancel={false}
          confirmText="知道了"
        />
      </div>

      {/* 示例3：警告提示 */}
      <div>
        <Button onClick={() => setWarningOpen(true)}>打开警告提示</Button>
        <EcsModal
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
          title="警告"
          type="warning"
          message="此操作可能会影响系统性能，请谨慎操作。"
        />
      </div>

      {/* 示例4：错误提示 */}
      <div>
        <Button onClick={() => setErrorOpen(true)}>打开错误提示</Button>
        <EcsModal
          open={errorOpen}
          onClose={() => setErrorOpen(false)}
          title="操作失败"
          type="error"
          message="网络连接失败，请检查您的网络设置后重试。"
        />
      </div>

      {/* 示例5：确认对话框 */}
      <div>
        <Button onClick={() => setConfirmOpen(true)}>打开确认对话框</Button>
        <EcsModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="确认删除"
          type="confirm"
          message="确定要删除这个供应商吗？此操作不可撤销。"
          confirmText="删除"
          confirmButtonProps={{ colorScheme: 'red' }}
          onConfirm={async () => {
            // 模拟删除操作
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log('删除成功')
            setConfirmOpen(false)
          }}
        />
      </div>

      {/* 示例6：表单弹窗 */}
      <div>
        <Button onClick={() => setFormOpen(true)}>打开表单弹窗</Button>
        <EcsModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title="编辑组织信息"
          width="large"
          type="form"
          description="请填写以下信息，带 * 号的为必填项。"
          onConfirm={async () => {
            // 表单提交逻辑
            console.log('表单提交')
            setFormOpen(false)
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
                placeholder="请输入组织名称"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                组织编码
              </label>
              <input
                type="text"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="请输入组织编码"
              />
            </div>
          </div>
        </EcsModal>
      </div>

      {/* 示例7：详情展示弹窗 */}
      <div>
        <Button onClick={() => setDetailOpen(true)}>打开详情弹窗</Button>
        <EcsModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                组织编码
              </label>
              <div className="text-sm text-gray-900">ORG001</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                组织类型
              </label>
              <div className="text-sm text-gray-900">内部组织</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                状态
              </label>
              <div className="text-sm text-green-600">启用</div>
            </div>
          </div>
        </EcsModal>
      </div>
    </div>
  )
}

export default EcsModalExamples
