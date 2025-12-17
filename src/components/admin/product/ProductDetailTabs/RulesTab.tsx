/**
 * 规则与文档Tab
 */
import { useTranslation } from 'react-i18next'
import {
  Box,
  VStack,
  Text,
  Heading,
  Divider,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'

interface RulesTabProps {
  data: ProductDetailAggregated
}

const RulesTab = ({ data }: RulesTabProps) => {
  const { t } = useTranslation()
  const { rules, overview } = data

  return (
    <VStack spacing={6} align="stretch">
      {/* 注意事项 */}
      {rules.notes && (
        <Box>
          <Heading size="md" mb={3}>{t('productManagement.detail.notes', '注意事项')}</Heading>
          <Text whiteSpace="pre-wrap" fontSize="sm">{rules.notes}</Text>
        </Box>
      )}

      {/* 所需材料 */}
      {rules.required_documents && (
        <Box>
          {rules.notes && <Divider my={4} />}
          <Heading size="md" mb={3}>{t('productManagement.detail.requiredDocuments', '所需材料')}</Heading>
          <Text whiteSpace="pre-wrap" fontSize="sm">{rules.required_documents}</Text>
        </Box>
      )}

      {/* 处理流程 */}
      {rules.processing_flow && (
        <Box>
          {(rules.notes || rules.required_documents) && <Divider my={4} />}
          <Heading size="md" mb={3}>{t('productManagement.detail.processingFlow', '处理流程')}</Heading>
          <Text whiteSpace="pre-wrap" fontSize="sm">{rules.processing_flow}</Text>
        </Box>
      )}

      {/* 常见问题 */}
      {rules.faq && (
        <Box>
          {(rules.notes || rules.required_documents || rules.processing_flow) && <Divider my={4} />}
          <Heading size="md" mb={3}>{t('productManagement.detail.faq', '常见问题')}</Heading>
          <Text whiteSpace="pre-wrap" fontSize="sm">{rules.faq}</Text>
        </Box>
      )}

      {/* 如果没有规则信息 */}
      {!rules.notes && !rules.required_documents && !rules.processing_flow && !rules.faq && (
        <Box>
          <Text color="gray.500">{t('productManagement.detail.noRulesInfo', '暂无规则与文档信息')}</Text>
        </Box>
      )}
    </VStack>
  )
}

export default RulesTab
