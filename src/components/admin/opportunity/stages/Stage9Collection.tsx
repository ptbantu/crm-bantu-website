/**
 * 阶段9：收款
 */
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Opportunity, OpportunityExtended } from '@/api/types'

interface Stage9CollectionProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

export const Stage9Collection: React.FC<Stage9CollectionProps> = ({ opportunityId, opportunity, onDataUpdate }) => {
  return (
    <Box>
      <Text fontSize="16px" fontWeight="600" mb={4}>
        阶段9：收款
      </Text>
      <VStack align="stretch" spacing={4}>
        <Text>收款管理（待实现）</Text>
      </VStack>
    </Box>
  )
}
