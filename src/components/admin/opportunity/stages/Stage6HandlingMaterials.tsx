/**
 * 阶段6：办理资料
 */
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Opportunity, OpportunityExtended } from '@/api/types'

interface Stage6HandlingMaterialsProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

export const Stage6HandlingMaterials: React.FC<Stage6HandlingMaterialsProps> = ({ opportunityId, opportunity, onDataUpdate }) => {
  return (
    <Box>
      <Text fontSize="16px" fontWeight="600" mb={4}>
        阶段6：办理资料
      </Text>
      <VStack align="stretch" spacing={4}>
        <Text>办理资料管理（待实现）</Text>
      </VStack>
    </Box>
  )
}
