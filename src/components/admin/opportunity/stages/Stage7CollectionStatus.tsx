/**
 * 阶段7：回款状态
 */
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Opportunity, OpportunityExtended } from '@/api/types'

interface Stage7CollectionStatusProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

export const Stage7CollectionStatus: React.FC<Stage7CollectionStatusProps> = ({ opportunityId, opportunity, onDataUpdate }) => {
  return (
    <Box>
      <Text fontSize="16px" fontWeight="600" mb={4}>
        阶段7：回款状态
      </Text>
      <VStack align="stretch" spacing={4}>
        <Text>回款状态管理（待实现）</Text>
      </VStack>
    </Box>
  )
}
