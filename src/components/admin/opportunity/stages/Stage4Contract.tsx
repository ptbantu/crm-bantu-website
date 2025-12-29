/**
 * 阶段4：合同
 * 三栏合同工作台：左侧模板库 + 中间合同编辑器 + 右侧预览与操作
 */
import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { FileText, Eye, Download, Save } from 'lucide-react'
import { Opportunity, OpportunityExtended } from '@/api/types'
import { StatusBadge } from '../common/StatusBadge'

interface Stage4ContractProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

interface ContractTemplate {
  id: string
  name: string
  category: string
  description: string
}

export const Stage4Contract: React.FC<Stage4ContractProps> = ({
  opportunityId,
  opportunity,
  onDataUpdate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [contractContent, setContractContent] = useState('')
  const [contractNumber, setContractNumber] = useState('')
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0])

  const templates: ContractTemplate[] = [
    {
      id: '1',
      name: '标准服务合同',
      category: '服务类',
      description: '适用于一般服务项目',
    },
    {
      id: '2',
      name: '长期服务合同',
      category: '服务类',
      description: '适用于长期服务项目',
    },
    {
      id: '3',
      name: '产品销售合同',
      category: '销售类',
      description: '适用于产品销售',
    },
  ]

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
          阶段4：合同
        </Text>

        <HStack spacing={4} align="stretch">
          {/* 左侧模板库（220px） */}
          <Box w="220px" flexShrink={0}>
            <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)" h="100%">
              <CardBody p={3}>
                <VStack spacing={3} align="stretch">
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)">
                    合同模板库
                  </Text>
                  <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        variant="outline"
                        size="sm"
                        cursor="pointer"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setContractContent(`合同内容模板：${template.name}\n\n[合同正文内容...]`)
                        }}
                        borderColor={
                          selectedTemplate?.id === template.id
                            ? 'var(--ali-primary)'
                            : 'var(--ali-border)'
                        }
                        bg={
                          selectedTemplate?.id === template.id
                            ? 'var(--ali-primary-light)'
                            : 'white'
                        }
                        _hover={{ borderColor: 'var(--ali-primary)' }}
                      >
                        <CardBody p={2}>
                          <VStack align="start" spacing={1}>
                            <HStack justify="space-between" w="100%">
                              <FileText size={14} color="var(--ali-primary)" />
                              <StatusBadge status="info" fontSize="10px">
                                {template.category}
                              </StatusBadge>
                            </HStack>
                            <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)">
                              {template.name}
                            </Text>
                            <Text fontSize="10px" color="var(--ali-text-secondary)">
                              {template.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* 中间合同编辑器 */}
          <Box flex="1" minW={0}>
            <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)" h="100%">
              <CardBody p={4}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)">
                      合同编辑器
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        leftIcon={<Save size={14} />}
                        size="sm"
                        variant="outline"
                        fontSize="11px"
                        h="32px"
                      >
                        保存
                      </Button>
                      <Button colorScheme="blue" size="sm" fontSize="11px" h="32px">
                        提交审批
                      </Button>
                    </HStack>
                  </HStack>

                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <Box>
                      <Text fontSize="11px" color="var(--ali-text-secondary)" mb={1}>
                        合同编号
                      </Text>
                      <Input
                        value={contractNumber}
                        onChange={(e) => setContractNumber(e.target.value)}
                        placeholder="自动生成或手动输入"
                        fontSize="12px"
                        h="32px"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="11px" color="var(--ali-text-secondary)" mb={1}>
                        合同日期
                      </Text>
                      <Input
                        type="date"
                        value={contractDate}
                        onChange={(e) => setContractDate(e.target.value)}
                        fontSize="12px"
                        h="32px"
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text fontSize="11px" color="var(--ali-text-secondary)" mb={1}>
                      合同内容
                    </Text>
                    <Textarea
                      value={contractContent}
                      onChange={(e) => setContractContent(e.target.value)}
                      placeholder="请输入合同内容..."
                      fontSize="12px"
                      minH="400px"
                      fontFamily="monospace"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* 右侧预览与操作 */}
          <Box w="280px" flexShrink={0}>
            <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)" h="100%">
              <CardBody p={3}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)">
                    预览与操作
                  </Text>

                  {/* 合同信息预览 */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="11px" color="var(--ali-text-secondary)">
                        合同编号：
                      </Text>
                      <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)">
                        {contractNumber || '待生成'}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="11px" color="var(--ali-text-secondary)">
                        合同日期：
                      </Text>
                      <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)">
                        {contractDate}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="11px" color="var(--ali-text-secondary)">
                        模板：
                      </Text>
                      <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)">
                        {selectedTemplate?.name || '未选择'}
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* 操作按钮 */}
                  <VStack spacing={2} align="stretch">
                    <Button
                      leftIcon={<Eye size={14} />}
                      size="sm"
                      variant="outline"
                      fontSize="11px"
                      h="32px"
                      w="100%"
                    >
                      预览合同
                    </Button>
                    <Button
                      leftIcon={<Download size={14} />}
                      size="sm"
                      variant="outline"
                      fontSize="11px"
                      h="32px"
                      w="100%"
                    >
                      下载PDF
                    </Button>
                  </VStack>

                  <Divider />

                  {/* 审批状态 */}
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="11px" fontWeight="500" color="var(--ali-text-secondary)">
                      审批状态
                    </Text>
                    <StatusBadge status="warning" fontSize="11px">
                      待提交
                    </StatusBadge>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </HStack>
      </VStack>
    </Box>
  )
}
