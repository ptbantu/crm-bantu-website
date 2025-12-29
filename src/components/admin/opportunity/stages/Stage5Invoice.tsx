/**
 * 阶段5：发票
 */
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Opportunity, OpportunityExtended } from '@/api/types'

interface Stage5InvoiceProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

export const Stage5Invoice: React.FC<Stage5InvoiceProps> = ({ opportunityId, opportunity, onDataUpdate }) => {
  return (
    <Box>
      <Text fontSize="16px" fontWeight="600" mb={4}>
        阶段5：发票
      </Text>
      <VStack align="stretch" spacing={4}>
        <Text>发票管理（待实现）</Text>
      </VStack>
    </Box>
  )
}
