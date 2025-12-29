/**
 * 阶段8：分配执行
 */
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Opportunity, OpportunityExtended } from '@/api/types'

interface Stage8AssignExecutionProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

export const Stage8AssignExecution: React.FC<Stage8AssignExecutionProps> = ({ opportunityId, opportunity, onDataUpdate }) => {
  return (
    <Box>
      <Text fontSize="16px" fontWeight="600" mb={4}>
        阶段8：分配执行
      </Text>
      <VStack align="stretch" spacing={4}>
        <Text>分配执行管理（待实现）</Text>
      </VStack>
    </Box>
  )
}
