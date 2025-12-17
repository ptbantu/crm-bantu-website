/**
 * 变更历史Tab
 */
import {
  Box,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'

interface HistoryTabProps {
  data: ProductDetailAggregated
}

const HistoryTab = ({ data }: HistoryTabProps) => {
  const { history } = data

  if (history.length === 0) {
    return (
      <Box>
        <Text color="gray.500">暂无变更历史</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">最近变更记录（最近{history.length}条）</Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>时间</Th>
            <Th>变更项</Th>
            <Th>原值</Th>
            <Th>新值</Th>
            <Th>操作人</Th>
          </Tr>
        </Thead>
        <Tbody>
          {history.map((item, index) => (
            <Tr key={index}>
              <Td fontSize="sm">
                {new Date(item.changed_at).toLocaleString('zh-CN')}
              </Td>
              <Td>{item.field_name || item.change_type}</Td>
              <Td fontSize="sm" color="gray.600">{item.old_value || '-'}</Td>
              <Td fontSize="sm" color="gray.600">{item.new_value || '-'}</Td>
              <Td fontSize="sm">{item.changed_by_name || item.changed_by || '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  )
}

export default HistoryTab
