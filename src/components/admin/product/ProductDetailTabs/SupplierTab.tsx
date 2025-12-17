/**
 * 供应商信息Tab
 */
import { Building2, Phone, Mail, MapPin, CheckCircle2, XCircle } from 'lucide-react'
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
  Badge,
  Heading,
  Divider,
  HStack,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'

interface SupplierTabProps {
  data: ProductDetailAggregated
}

const SupplierTab = ({ data }: SupplierTabProps) => {
  const { suppliers } = data

  if (suppliers.length === 0) {
    return (
      <Box>
        <Text color="gray.500">暂无供应商信息</Text>
      </Box>
    )
  }

  // 分离主要供应商和备选供应商
  const primarySuppliers = suppliers.filter(s => s.is_primary)
  const alternativeSuppliers = suppliers.filter(s => !s.is_primary)

  return (
    <VStack spacing={6} align="stretch">
      {/* 主要供应商 */}
      {primarySuppliers.length > 0 && (
        <Box>
          <Heading size="md" mb={4}>
            主要供应商
          </Heading>
          {primarySuppliers.map((supplier, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Text fontWeight="bold">{supplier.vendor_name || '未知供应商'}</Text>
                  <Badge colorScheme="yellow">黄金级供应商</Badge>
                  {supplier.is_available ? (
                    <Badge colorScheme="green">
                      <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                      合作中
                    </Badge>
                  ) : (
                    <Badge colorScheme="red">
                      <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      暂停
                    </Badge>
                  )}
                </HStack>
                {supplier.contact_name && (
                  <HStack fontSize="sm" color="gray.600">
                    <Text>联系人：{supplier.contact_name}</Text>
                  </HStack>
                )}
                {supplier.contact_phone && (
                  <HStack fontSize="sm" color="gray.600">
                    <Phone size={14} />
                    <Text>{supplier.contact_phone}</Text>
                  </HStack>
                )}
                {supplier.contact_email && (
                  <HStack fontSize="sm" color="gray.600">
                    <Mail size={14} />
                    <Text>{supplier.contact_email}</Text>
                  </HStack>
                )}
                {supplier.address && (
                  <HStack fontSize="sm" color="gray.600">
                    <MapPin size={14} />
                    <Text>{supplier.address}</Text>
                  </HStack>
                )}
                {supplier.sla_description && (
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    SLA: {supplier.sla_description}
                  </Text>
                )}
                {supplier.contract_start && supplier.contract_end && (
                  <Text fontSize="sm" color="gray.600">
                    合同：{new Date(supplier.contract_start).toLocaleDateString('zh-CN')} ~ {new Date(supplier.contract_end).toLocaleDateString('zh-CN')}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </Box>
      )}

      {/* 备选供应商 */}
      {alternativeSuppliers.length > 0 && (
        <Box>
          {primarySuppliers.length > 0 && <Divider my={4} />}
          <Heading size="md" mb={4}>
            备选供应商 ({alternativeSuppliers.length}家)
          </Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>名称</Th>
                <Th>等级</Th>
                <Th>联系人</Th>
                <Th>电话</Th>
                <Th>状态</Th>
              </Tr>
            </Thead>
            <Tbody>
              {alternativeSuppliers.map((supplier, index) => (
                <Tr key={index}>
                  <Td>{supplier.vendor_name || '未知供应商'}</Td>
                  <Td>
                    <Badge colorScheme="gray">白银级</Badge>
                  </Td>
                  <Td>{supplier.contact_name || '-'}</Td>
                  <Td>{supplier.contact_phone || '-'}</Td>
                  <Td>
                    {supplier.is_available ? (
                      <Badge colorScheme="green">备用</Badge>
                    ) : (
                      <Badge colorScheme="red">暂停</Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </VStack>
  )
}

export default SupplierTab
