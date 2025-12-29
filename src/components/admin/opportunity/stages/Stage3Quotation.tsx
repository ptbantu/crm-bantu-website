/**
 * 阶段3：报价单
 * 顶部操作栏 + 报价单表格（可编辑） + 底部汇总栏
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
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
} from '@chakra-ui/react'
import { Download, Printer, Save, Plus, Trash2, Edit2 } from 'lucide-react'
import { Opportunity, OpportunityExtended } from '@/api/types'
import { StatusBadge } from '../common/StatusBadge'

interface Stage3QuotationProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

interface QuotationItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  editable?: boolean
}

export const Stage3Quotation: React.FC<Stage3QuotationProps> = ({
  opportunityId,
  opportunity,
  onDataUpdate,
}) => {
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      name: '公司注册服务',
      quantity: 1,
      unitPrice: 5000000,
      discount: 0,
      total: 5000000,
      editable: true,
    },
    {
      id: '2',
      name: '税务申报服务',
      quantity: 12,
      unitPrice: 2000000,
      discount: 5,
      total: 22800000,
      editable: true,
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            updated.total =
              updated.quantity *
              updated.unitPrice *
              (1 - updated.discount / 100)
          }
          return updated
        }
        return item
      })
    )
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0,
        editable: true,
      },
    ])
    setEditingId(Date.now().toString())
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.11 // 假设11%税
  const total = subtotal + tax

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* 顶部操作栏 */}
        <HStack justify="space-between">
          <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
            阶段3：报价单
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
            <Button
              leftIcon={<Download size={14} />}
              size="sm"
              variant="outline"
              fontSize="11px"
              h="32px"
            >
              导出
            </Button>
            <Button
              leftIcon={<Printer size={14} />}
              size="sm"
              variant="outline"
              fontSize="11px"
              h="32px"
            >
              打印
            </Button>
            <Button colorScheme="blue" size="sm" fontSize="11px" h="32px">
              提交审批
            </Button>
          </HStack>
        </HStack>

        {/* 报价单表格 */}
        <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
          <CardBody p={0}>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      序号
                    </Th>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      项目名称
                    </Th>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      数量
                    </Th>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      单价
                    </Th>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      折扣 (%)
                    </Th>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      小计
                    </Th>
                    <Th fontSize="11px" fontWeight="600" color="var(--ali-text-secondary)" px={3} py={2}>
                      操作
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((item, index) => (
                    <Tr key={item.id}>
                      <Td fontSize="12px" px={3} py={2}>
                        {index + 1}
                      </Td>
                      <Td px={3} py={2}>
                        {editingId === item.id ? (
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            size="sm"
                            fontSize="12px"
                            h="28px"
                          />
                        ) : (
                          <Text fontSize="12px">{item.name || '-'}</Text>
                        )}
                      </Td>
                      <Td px={3} py={2}>
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)
                            }
                            size="sm"
                            fontSize="12px"
                            h="28px"
                            w="80px"
                          />
                        ) : (
                          <Text fontSize="12px">{item.quantity}</Text>
                        )}
                      </Td>
                      <Td px={3} py={2}>
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            size="sm"
                            fontSize="12px"
                            h="28px"
                            w="120px"
                          />
                        ) : (
                          <Text fontSize="12px">IDR {item.unitPrice.toLocaleString()}</Text>
                        )}
                      </Td>
                      <Td px={3} py={2}>
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)
                            }
                            size="sm"
                            fontSize="12px"
                            h="28px"
                            w="80px"
                          />
                        ) : (
                          <Text fontSize="12px">{item.discount}%</Text>
                        )}
                      </Td>
                      <Td px={3} py={2}>
                        <Text fontSize="12px" fontWeight="500">
                          IDR {item.total.toLocaleString()}
                        </Text>
                      </Td>
                      <Td px={3} py={2}>
                        <HStack spacing={1}>
                          {editingId === item.id ? (
                            <IconButton
                              aria-label="保存"
                              icon={<Save size={12} />}
                              size="xs"
                              onClick={() => setEditingId(null)}
                            />
                          ) : (
                            <IconButton
                              aria-label="编辑"
                              icon={<Edit2 size={12} />}
                              size="xs"
                              onClick={() => setEditingId(item.id)}
                            />
                          )}
                          <IconButton
                            aria-label="删除"
                            icon={<Trash2 size={12} />}
                            size="xs"
                            colorScheme="red"
                            onClick={() => deleteItem(item.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Box p={3} borderTop="1px solid var(--ali-border)">
              <Button
                leftIcon={<Plus size={14} />}
                size="sm"
                variant="outline"
                onClick={addItem}
                fontSize="11px"
                h="28px"
              >
                添加项目
              </Button>
            </Box>
          </CardBody>
        </Card>

        {/* 底部汇总栏（固定） */}
        <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)" position="sticky" bottom={0} bg="white">
          <CardBody p={3}>
            <HStack justify="flex-end" spacing={6}>
              <VStack align="end" spacing={1}>
                <HStack spacing={4}>
                  <Text fontSize="11px" color="var(--ali-text-secondary)">
                    小计：
                  </Text>
                  <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                    IDR {subtotal.toLocaleString()}
                  </Text>
                </HStack>
                <HStack spacing={4}>
                  <Text fontSize="11px" color="var(--ali-text-secondary)">
                    税费 (11%)：
                  </Text>
                  <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                    IDR {tax.toLocaleString()}
                  </Text>
                </HStack>
                <HStack spacing={4} pt={2} borderTop="1px solid var(--ali-border)">
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)">
                    总计：
                  </Text>
                  <Text fontSize="14px" fontWeight="600" color="var(--ali-primary)">
                    IDR {total.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* 资料关联区 */}
        <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
          <CardBody p={3}>
            <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
              关联资料
            </Text>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between" p={2} bg="var(--ali-bg-light)" borderRadius="4px">
                <Text fontSize="11px" color="var(--ali-text-primary)">
                  报价单模板.pdf
                </Text>
                <StatusBadge status="success" fontSize="10px">
                  已关联
                </StatusBadge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
