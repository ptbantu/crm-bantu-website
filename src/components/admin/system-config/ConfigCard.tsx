/**
 * 配置卡片组件
 * 阿里云ECS风格的卡片布局
 */
import { ReactNode } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Box,
  Badge,
  HStack,
} from '@chakra-ui/react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ConfigCardProps {
  title: string
  status?: 'enabled' | 'disabled'
  children: ReactNode
  actions?: ReactNode
}

export const ConfigCard = ({
  title,
  status,
  children,
  actions,
}: ConfigCardProps) => {
  return (
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="8px"
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <CardHeader
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        py={3}
        px={4}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Heading size="md" color="gray.700">
              {title}
            </Heading>
            {status && (
              <Badge
                colorScheme={status === 'enabled' ? 'green' : 'gray'}
                display="flex"
                alignItems="center"
                gap={1}
              >
                {status === 'enabled' ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <XCircle size={12} />
                )}
                {status === 'enabled' ? '已启用' : '已禁用'}
              </Badge>
            )}
          </HStack>
          {actions && <Box>{actions}</Box>}
        </HStack>
      </CardHeader>
      <CardBody p={4}>{children}</CardBody>
    </Card>
  )
}
