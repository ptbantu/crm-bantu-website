/**
 * 变更历史Tab
 */
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { history } = data

  if (history.length === 0) {
    return (
      <Box>
        <Text color="gray.500">{t('productManagement.detail.noChangeHistory', '暂无变更历史')}</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">{t('productManagement.detail.recentChanges', '最近变更记录')}（{t('productManagement.detail.recent', '最近')}{history.length}{t('productManagement.detail.items', '条')}）</Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>{t('productManagement.detail.time', '时间')}</Th>
            <Th>{t('productManagement.detail.changeItem', '变更项')}</Th>
            <Th>{t('productManagement.detail.oldValue', '原值')}</Th>
            <Th>{t('productManagement.detail.newValue', '新值')}</Th>
            <Th>{t('productManagement.detail.operator', '操作人')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {history.map((item, index) => (
            <Tr key={index}>
              <Td fontSize="sm">
                {new Date(item.changed_at).toLocaleString()}
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
