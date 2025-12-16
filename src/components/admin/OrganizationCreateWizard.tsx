/**
 * 组织新增/编辑向导组件 - 分步式表单
 * 采用4步流程：基础身份 → 联系与地址 → 工商与财务 → 补充与提交
 */
import { useState, useEffect } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import EcsModal from './EcsModal'
import { Button, Input, Select, Textarea, HStack, VStack, FormControl, FormLabel, FormErrorMessage, Grid, GridItem } from '@chakra-ui/react'
import clsx from 'clsx'

// 完整的组织表单数据类型
export interface OrganizationFormData {
  // 步骤1: 基础身份
  name: string
  code?: string
  external_id?: string
  organization_type: 'internal' | 'vendor' | 'agent'
  company_nature?: string
  
  // 步骤2: 联系与地址
  email?: string
  phone?: string
  website?: string
  country?: string
  country_code?: string
  state_province?: string
  city?: string
  street?: string
  postal_code?: string
  
  // 步骤3: 工商与财务
  registration_number?: string
  tax_id?: string
  legal_representative?: string
  established_date?: string // YYYY-MM-DD
  company_status?: string
  registered_capital?: number
  registered_capital_currency?: string
  employee_count?: number
  company_size?: string
  industry?: string
  industry_code?: string
  sub_industry?: string
  
  // 步骤4: 补充信息
  business_scope?: string
  description?: string
  is_active?: boolean
}

interface OrganizationCreateWizardProps {
  open: boolean
  onClose: () => void
  onSubmit: (formData: OrganizationFormData) => Promise<void>
  initialData?: Partial<OrganizationFormData>
  mode?: 'create' | 'edit'
}

const STORAGE_KEY = 'organization_wizard_draft'

// 步骤配置
const STEPS = [
  { key: 'basic', title: '基础身份' },
  { key: 'contact', title: '联系与地址' },
  { key: 'business', title: '工商与财务' },
  { key: 'supplement', title: '补充与提交' },
]

const OrganizationCreateWizard = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: OrganizationCreateWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    organization_type: 'internal',
    registered_capital_currency: 'CNY',
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      // 优先使用传入的初始数据，否则尝试从localStorage恢复草稿
      const draftData = initialData || loadDraft()
      if (draftData) {
        setFormData({
          name: '',
          organization_type: 'internal',
          registered_capital_currency: 'CNY',
          is_active: true,
          ...draftData,
        })
      } else {
        setFormData({
          name: '',
          organization_type: 'internal',
          registered_capital_currency: 'CNY',
          is_active: true,
        })
      }
      setCurrentStep(0)
      setErrors({})
    }
  }, [open, initialData])

  // 保存草稿到localStorage
  const saveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    } catch (e) {
      console.warn('Failed to save draft:', e)
    }
  }

  // 从localStorage加载草稿
  const loadDraft = (): Partial<OrganizationFormData> | null => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY)
      return draft ? JSON.parse(draft) : null
    } catch (e) {
      return null
    }
  }

  // 清除草稿
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // ignore
    }
  }

  // 更新表单字段
  const updateField = (field: keyof OrganizationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    // 自动保存草稿
    setTimeout(saveDraft, 300)
  }

  // 验证当前步骤
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      // 步骤1: 基础身份 - 必填项验证
      if (!formData.name?.trim()) {
        newErrors.name = '组织名称不能为空'
      }
      if (!formData.organization_type) {
        newErrors.organization_type = '请选择组织类型'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 下一步
  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveDraft()
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  // 上一步
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // 跳转到指定步骤
  const handleStepClick = (stepIndex: number) => {
    // 只能跳转到已完成的步骤
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setSubmitting(true)
    try {
      // 创建模式下，不发送 code 和 external_id，让后端自动生成
      const submitData = { ...formData }
      if (mode === 'create') {
        delete submitData.code
        delete submitData.external_id
      }
      await onSubmit(submitData)
      clearDraft()
      onClose()
    } catch (error: any) {
      console.error('Submit error:', error)
      // 错误由父组件处理
    } finally {
      setSubmitting(false)
    }
  }

  // 关闭弹窗
  const handleClose = () => {
    saveDraft() // 保存草稿
    onClose()
  }

  // 渲染步骤条
  const renderStepIndicator = () => {
    return (
      <div className="px-6 py-4 border-b border-[#F0F0F0] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const canClick = isCompleted

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => canClick && handleStepClick(index)}
                    disabled={!canClick}
                    className={clsx(
                      'flex items-center gap-2 flex-1',
                      canClick && 'cursor-pointer',
                      !canClick && 'cursor-not-allowed'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-colors',
                        isCompleted && 'bg-[#1890FF] text-white',
                        isCurrent && 'bg-[#1890FF] text-white font-semibold',
                        !isCompleted && !isCurrent && 'bg-[#F0F0F0] text-[#BFBFBF]'
                      )}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                    </div>
                    <span
                      className={clsx(
                        'text-[13px] font-medium',
                        isCurrent && 'text-[#1890FF] font-semibold',
                        isCompleted && 'text-[#1890FF]',
                        !isCompleted && !isCurrent && 'text-[#8C8C8C]'
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight
                      size={16}
                      className={clsx(
                        'mx-2',
                        isCompleted ? 'text-[#1890FF]' : 'text-[#BFBFBF]'
                      )}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 渲染步骤1: 基础身份信息
  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                组织名称 <span className="text-red-500">*</span>
              </FormLabel>
              <Input
                size="sm"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="请输入组织名称"
                className="h-8 text-[13px]"
              />
              {errors.name && (
                <FormErrorMessage className="text-[12px] text-[#FF4D4F] mt-1">
                  {errors.name}
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.organization_type} isRequired>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                组织类型 <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                size="sm"
                value={formData.organization_type || 'internal'}
                onChange={(e) =>
                  updateField('organization_type', e.target.value as 'internal' | 'vendor' | 'agent')
                }
                className="h-8 text-[13px]"
              >
                <option value="internal">内部组织</option>
                <option value="vendor">供应商</option>
                <option value="agent">渠道代理</option>
              </Select>
              {errors.organization_type && (
                <FormErrorMessage className="text-[12px] text-[#FF4D4F] mt-1">
                  {errors.organization_type}
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>

          {/* 编辑模式下显示只读的组织代码和外部ID */}
          {mode === 'edit' && (
            <>
              <GridItem>
                <FormControl>
                  <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                    组织代码
                  </FormLabel>
                  <Input
                    size="sm"
                    value={formData.code || ''}
                    readOnly
                    className="h-8 text-[13px] bg-gray-50 cursor-not-allowed"
                  />
                  <div className="text-[11px] text-gray-500 mt-1">由系统自动生成</div>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                    外部ID
                  </FormLabel>
                  <Input
                    size="sm"
                    value={formData.external_id || ''}
                    readOnly
                    className="h-8 text-[13px] bg-gray-50 cursor-not-allowed"
                  />
                  <div className="text-[11px] text-gray-500 mt-1">由系统自动生成</div>
                </FormControl>
              </GridItem>
            </>
          )}

          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                公司性质
              </FormLabel>
              <Select
                size="sm"
                value={formData.company_nature || ''}
                onChange={(e) => updateField('company_nature', e.target.value)}
                className="h-8 text-[13px]"
              >
                <option value="">请选择</option>
                <option value="state_owned">国有企业</option>
                <option value="private">民营企业</option>
                <option value="foreign">外资企业</option>
                <option value="joint_venture">合资企业</option>
                <option value="other">其他</option>
              </Select>
            </FormControl>
          </GridItem>
        </Grid>
      </div>
    )
  }

  // 渲染步骤2: 联系与地址信息
  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                邮箱
              </FormLabel>
              <Input
                size="sm"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="example@company.com"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                电话
              </FormLabel>
              <Input
                size="sm"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+62 xxx xxxx xxxx"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                官网
              </FormLabel>
              <Input
                size="sm"
                type="url"
                value={formData.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://www.example.com"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                国家/地区
              </FormLabel>
              <Select
                size="sm"
                value={formData.country || ''}
                onChange={(e) => {
                  updateField('country', e.target.value)
                  // 自动设置国家代码（简化处理）
                  const countryCodes: Record<string, string> = {
                    '中国': 'CN',
                    '印度尼西亚': 'ID',
                    '新加坡': 'SG',
                  }
                  if (countryCodes[e.target.value]) {
                    updateField('country_code', countryCodes[e.target.value])
                  }
                }}
                className="h-8 text-[13px]"
              >
                <option value="">请选择</option>
                <option value="中国">中国</option>
                <option value="印度尼西亚">印度尼西亚</option>
                <option value="新加坡">新加坡</option>
                <option value="其他">其他</option>
              </Select>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                省/州
              </FormLabel>
              <Input
                size="sm"
                value={formData.state_province || ''}
                onChange={(e) => updateField('state_province', e.target.value)}
                placeholder="省/州"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                城市
              </FormLabel>
              <Input
                size="sm"
                value={formData.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="城市"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                邮编
              </FormLabel>
              <Input
                size="sm"
                value={formData.postal_code || ''}
                onChange={(e) => updateField('postal_code', e.target.value)}
                placeholder="邮政编码"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                详细地址
              </FormLabel>
              <Input
                size="sm"
                value={formData.street || ''}
                onChange={(e) => updateField('street', e.target.value)}
                placeholder="街道地址"
                className="h-8 text-[13px]"
              />
            </FormControl>
          </GridItem>
        </Grid>
      </div>
    )
  }

  // 渲染步骤3: 工商与财务概览
  const renderStep3 = () => {
    return (
      <div className="space-y-6">
        {/* 工商信息 */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">工商信息</h3>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  统一社会信用代码/注册号
                </FormLabel>
                <Input
                  size="sm"
                  value={formData.registration_number || ''}
                  onChange={(e) => updateField('registration_number', e.target.value)}
                  placeholder="注册号"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  税号
                </FormLabel>
                <Input
                  size="sm"
                  value={formData.tax_id || ''}
                  onChange={(e) => updateField('tax_id', e.target.value)}
                  placeholder="税务登记号"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  法人代表
                </FormLabel>
                <Input
                  size="sm"
                  value={formData.legal_representative || ''}
                  onChange={(e) => updateField('legal_representative', e.target.value)}
                  placeholder="法人姓名"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  成立日期
                </FormLabel>
                <Input
                  size="sm"
                  type="date"
                  value={formData.established_date || ''}
                  onChange={(e) => updateField('established_date', e.target.value)}
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  公司状态
                </FormLabel>
                <Select
                  size="sm"
                  value={formData.company_status || ''}
                  onChange={(e) => updateField('company_status', e.target.value)}
                  className="h-8 text-[13px]"
                >
                  <option value="">请选择</option>
                  <option value="normal">正常</option>
                  <option value="cancelled">注销</option>
                  <option value="revoked">吊销</option>
                  <option value="other">其他</option>
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
        </div>

        {/* 资本与规模 */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">资本与规模</h3>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  注册资本
                </FormLabel>
                <HStack spacing={2}>
                  <Input
                    size="sm"
                    type="number"
                    value={formData.registered_capital || ''}
                    onChange={(e) => updateField('registered_capital', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="金额"
                    className="h-8 text-[13px] flex-1"
                  />
                  <Select
                    size="sm"
                    value={formData.registered_capital_currency || 'CNY'}
                    onChange={(e) => updateField('registered_capital_currency', e.target.value)}
                    className="h-8 text-[13px] w-24"
                  >
                    <option value="CNY">CNY</option>
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                  </Select>
                </HStack>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  员工人数
                </FormLabel>
                <Input
                  size="sm"
                  type="number"
                  value={formData.employee_count || ''}
                  onChange={(e) => updateField('employee_count', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="人数"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  公司规模
                </FormLabel>
                <Select
                  size="sm"
                  value={formData.company_size || ''}
                  onChange={(e) => updateField('company_size', e.target.value)}
                  className="h-8 text-[13px]"
                >
                  <option value="">请选择</option>
                  <option value="micro">微型</option>
                  <option value="small">小型</option>
                  <option value="medium">中型</option>
                  <option value="large">大型</option>
                  <option value="enterprise">企业级</option>
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
        </div>

        {/* 行业信息 */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-3">行业信息</h3>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  所属行业
                </FormLabel>
                <Input
                  size="sm"
                  value={formData.industry || ''}
                  onChange={(e) => updateField('industry', e.target.value)}
                  placeholder="行业名称"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  行业代码
                </FormLabel>
                <Input
                  size="sm"
                  value={formData.industry_code || ''}
                  onChange={(e) => updateField('industry_code', e.target.value)}
                  placeholder="行业代码"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                  细分行业
                </FormLabel>
                <Input
                  size="sm"
                  value={formData.sub_industry || ''}
                  onChange={(e) => updateField('sub_industry', e.target.value)}
                  placeholder="细分行业"
                  className="h-8 text-[13px]"
                />
              </FormControl>
            </GridItem>
          </Grid>
        </div>
      </div>
    )
  }

  // 渲染步骤4: 补充信息与提交预览
  const renderStep4 = () => {
    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem>
          <div className="space-y-4">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">补充信息</h3>
            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                经营范围
              </FormLabel>
              <Textarea
                size="sm"
                value={formData.business_scope || ''}
                onChange={(e) => updateField('business_scope', e.target.value)}
                placeholder="经营范围描述"
                rows={4}
                className="text-[13px]"
              />
            </FormControl>

            <FormControl>
              <FormLabel className="text-[13px] font-medium text-gray-700 mb-1">
                备注描述
              </FormLabel>
              <Textarea
                size="sm"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="组织描述或备注"
                rows={4}
                className="text-[13px]"
              />
            </FormControl>

            <FormControl>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[13px] font-medium text-gray-700">启用状态</span>
              </label>
            </FormControl>
          </div>
        </GridItem>

        <GridItem>
          <div className="bg-[#FAFAFA] border border-[#F0F0F0] rounded p-4">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">信息预览</h3>
            <VStack align="stretch" spacing={2} className="text-[12px]">
              <div className="flex justify-between">
                <span className="text-gray-500">组织名称:</span>
                <span className="text-gray-900 font-medium">{formData.name || '-'}</span>
              </div>
              {mode === 'edit' && formData.code && (
                <div className="flex justify-between">
                  <span className="text-gray-500">组织代码:</span>
                  <span className="text-gray-900">{formData.code}</span>
                </div>
              )}
              {mode === 'edit' && formData.external_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">外部ID:</span>
                  <span className="text-gray-900">{formData.external_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">组织类型:</span>
                <span className="text-gray-900">
                  {formData.organization_type === 'internal'
                    ? '内部组织'
                    : formData.organization_type === 'vendor'
                    ? '供应商'
                    : '渠道代理'}
                </span>
              </div>
              {formData.company_nature && (
                <div className="flex justify-between">
                  <span className="text-gray-500">公司性质:</span>
                  <span className="text-gray-900">
                    {formData.company_nature === 'state_owned'
                      ? '国有企业'
                      : formData.company_nature === 'private'
                      ? '民营企业'
                      : formData.company_nature === 'foreign'
                      ? '外资企业'
                      : formData.company_nature === 'joint_venture'
                      ? '合资企业'
                      : '其他'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">状态:</span>
                <span className={formData.is_active ? 'text-green-600' : 'text-red-600'}>
                  {formData.is_active ? '启用' : '禁用'}
                </span>
              </div>
              {formData.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">邮箱:</span>
                  <span className="text-gray-900">{formData.email}</span>
                </div>
              )}
              {formData.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">电话:</span>
                  <span className="text-gray-900">{formData.phone}</span>
                </div>
              )}
            </VStack>
          </div>
        </GridItem>
      </Grid>
    )
  }

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1()
      case 1:
        return renderStep2()
      case 2:
        return renderStep3()
      case 3:
        return renderStep4()
      default:
        return null
    }
  }

  return (
    <EcsModal
      open={open}
      onClose={handleClose}
      title={mode === 'create' ? '新增组织' : '编辑组织'}
      width="large"
      type="form"
      closable={true}
      showFooter={false}
    >
      <div className="flex flex-col h-[650px]">
        {/* 步骤条 */}
        {renderStepIndicator()}

        {/* 表单内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(650px - 180px)' }}>
          {renderStepContent()}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA] flex items-center justify-between flex-shrink-0">
          <div>
            {currentStep > 0 && (
              <Button size="sm" variant="outline" onClick={handlePrev} className="text-[13px]">
                上一步
              </Button>
            )}
          </div>
          <div className="text-[12px] text-gray-500">
            步骤 {currentStep + 1} / {STEPS.length} - {STEPS[currentStep].title}
          </div>
          <HStack spacing={2}>
            <Button size="sm" variant="outline" onClick={handleClose} className="text-[13px]">
              取消
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button size="sm" colorScheme="blue" onClick={handleNext} className="text-[13px]">
                下一步
              </Button>
            ) : (
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={submitting}
                className="text-[13px]"
              >
                {mode === 'create' ? '提交' : '保存'}
              </Button>
            )}
          </HStack>
        </div>
      </div>
    </EcsModal>
  )
}

export default OrganizationCreateWizard
