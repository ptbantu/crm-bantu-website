/**
 * 企业信息查询组件
 * 集成天眼查API进行企业信息查询 - 阿里云ECS风格
 * 两步查询流程：816接口搜索企业列表，818接口获取企业详细信息
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  VStack,
  HStack,
  Box,
  Text,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react'
import { Search, ArrowLeft } from 'lucide-react'
import { 
  searchEnterprises, 
  getEnterpriseDetail,
  EnterpriseListItem,
  EnterpriseInfo, 
  ShareholderInfo 
} from '@/api/tianyancha'

export const EnterpriseQueryComponent = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [enterpriseList, setEnterpriseList] = useState<EnterpriseListItem[]>([])
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)

  // 第一步：搜索企业列表
  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: t('queryTool.enterprise.keywordRequired'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    setError(null)
    setEnterpriseList([])
    setSelectedEnterprise(null)
    setPageNum(1)

    try {
      const result = await searchEnterprises(keyword.trim(), 1, pageSize)
      
      if (result.success && result.data) {
        setEnterpriseList(result.data)
        setTotal(result.total || 0)
        toast({
          title: t('queryTool.enterprise.searchSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        setError(result.message || t('queryTool.enterprise.searchFailed'))
        toast({
          title: t('queryTool.enterprise.searchFailed'),
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (err: any) {
      const errorMsg = err.message || t('queryTool.enterprise.searchError')
      setError(errorMsg)
      toast({
        title: t('queryTool.enterprise.searchError'),
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // 第二步：获取企业详细信息
  const handleSelectEnterprise = async (enterpriseId: string) => {
    if (!enterpriseId) {
      return
    }

    setLoadingDetail(true)
    setError(null)

    try {
      const result = await getEnterpriseDetail(enterpriseId)
      
      if (result.success && result.data) {
        setSelectedEnterprise(result.data)
        toast({
          title: t('queryTool.enterprise.querySuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        setError(result.message || t('queryTool.enterprise.queryFailed'))
        toast({
          title: t('queryTool.enterprise.queryFailed'),
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (err: any) {
      const errorMsg = err.message || t('queryTool.enterprise.queryError')
      setError(errorMsg)
      toast({
        title: t('queryTool.enterprise.queryError'),
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch()
    }
  }

  const handleBackToList = () => {
    setSelectedEnterprise(null)
  }

  // 如果已选择企业，显示详细信息
  if (selectedEnterprise) {
    return (
      <Card
        bg="white"
        borderRadius="4px"
        boxShadow="var(--ali-card-shadow)"
        _hover={{ boxShadow: 'var(--ali-card-shadow-hover)' }}
        transition="all 0.2s"
      >
        <CardBody p={6}>
          <VStack spacing={4} align="stretch">
            {/* 返回按钮 */}
            <HStack>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                onClick={handleBackToList}
                size="sm"
                variant="ghost"
                colorScheme="blue"
              >
                {t('queryTool.enterprise.backToList')}
              </Button>
            </HStack>

            {/* 加载状态 */}
            {loadingDetail && (
              <Box textAlign="center" py={12}>
                <Spinner size="xl" color="var(--ali-primary)" thickness="3px" />
                <Text mt={4} fontSize="14px" color="var(--ali-text-secondary)">
                  {t('queryTool.enterprise.querying')}
                </Text>
              </Box>
            )}

            {/* 企业详细信息 */}
            {!loadingDetail && (
              <Box>
                <Divider my={4} borderColor="var(--ali-border)" />
                
                {/* 基本信息 */}
                <Box mb={6}>
                  <Text fontSize="16px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
                    {t('queryTool.enterprise.basicInfo')}
                  </Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr bg="var(--ali-bg-light)">
                          <Th 
                            fontSize="12px" 
                            fontWeight="600" 
                            color="var(--ali-text-primary)"
                            py={3}
                            px={4}
                            borderBottom="1px solid"
                            borderColor="var(--ali-border)"
                            width="150px"
                          >
                            {t('queryTool.enterprise.field')}
                          </Th>
                          <Th 
                            fontSize="12px" 
                            fontWeight="600" 
                            color="var(--ali-text-primary)"
                            py={3}
                            px={4}
                            borderBottom="1px solid"
                            borderColor="var(--ali-border)"
                          >
                            {t('queryTool.enterprise.value')}
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedEnterprise.name && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.name')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.name}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.credit_code && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.creditCode')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.credit_code}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.registration_number && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.registrationNumber')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.registration_number}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.legal_representative && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.legalRepresentative')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.legal_representative}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.registered_capital && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.registeredCapital')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.registered_capital}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.establishment_date && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.establishmentDate')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.establishment_date}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.business_status && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.businessStatus')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              <Badge
                                colorScheme={
                                  selectedEnterprise.business_status.includes('存续') ||
                                  selectedEnterprise.business_status.includes('在业')
                                    ? 'green'
                                    : 'gray'
                                }
                                fontSize="12px"
                                px={2}
                                py={1}
                                borderRadius="2px"
                              >
                                {selectedEnterprise.business_status}
                              </Badge>
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.company_type && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.companyType')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.company_type}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.industry && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.industry')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.industry}
                            </Td>
                          </Tr>
                        )}
                        {selectedEnterprise.address && (
                          <Tr _hover={{ bg: 'var(--ali-primary-light)' }} transition="background 0.2s">
                            <Td 
                              fontSize="13px" 
                              fontWeight="500" 
                              color="var(--ali-text-secondary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.address')}
                            </Td>
                            <Td 
                              fontSize="13px" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {selectedEnterprise.address}
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* 经营范围 */}
                {selectedEnterprise.business_scope && (
                  <Box mb={6}>
                    <Text fontSize="16px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
                      {t('queryTool.enterprise.businessScope')}
                    </Text>
                    <Box
                      p={4}
                      bg="var(--ali-bg-light)"
                      borderRadius="4px"
                      border="1px solid"
                      borderColor="var(--ali-border)"
                    >
                      <Text fontSize="13px" color="var(--ali-text-primary)" lineHeight="1.6" whiteSpace="pre-wrap">
                        {selectedEnterprise.business_scope}
                      </Text>
                    </Box>
                  </Box>
                )}

                {/* 股东信息 */}
                {selectedEnterprise.shareholders && selectedEnterprise.shareholders.length > 0 && (
                  <Box>
                    <Text fontSize="16px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
                      {t('queryTool.enterprise.shareholders')}
                    </Text>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr bg="var(--ali-bg-light)">
                            <Th 
                              fontSize="12px" 
                              fontWeight="600" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.shareholderName')}
                            </Th>
                            <Th 
                              fontSize="12px" 
                              fontWeight="600" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.shareholderType')}
                            </Th>
                            <Th 
                              fontSize="12px" 
                              fontWeight="600" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.capital')}
                            </Th>
                            <Th 
                              fontSize="12px" 
                              fontWeight="600" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.capitalActual')}
                            </Th>
                            <Th 
                              fontSize="12px" 
                              fontWeight="600" 
                              color="var(--ali-text-primary)"
                              py={3}
                              px={4}
                              borderBottom="1px solid"
                              borderColor="var(--ali-border)"
                            >
                              {t('queryTool.enterprise.ratio')}
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedEnterprise.shareholders.map((shareholder: ShareholderInfo, index: number) => (
                            <Tr 
                              key={index}
                              _hover={{ bg: 'var(--ali-primary-light)' }}
                              transition="background 0.2s"
                              bg={index % 2 === 0 ? 'white' : 'var(--ali-bg-light)'}
                            >
                              <Td 
                                fontSize="13px" 
                                color="var(--ali-text-primary)"
                                py={3}
                                px={4}
                                borderBottom="1px solid"
                                borderColor="var(--ali-border)"
                              >
                                {shareholder.name || '-'}
                              </Td>
                              <Td 
                                fontSize="13px" 
                                color="var(--ali-text-primary)"
                                py={3}
                                px={4}
                                borderBottom="1px solid"
                                borderColor="var(--ali-border)"
                              >
                                {shareholder.type || '-'}
                              </Td>
                              <Td 
                                fontSize="13px" 
                                color="var(--ali-text-primary)"
                                py={3}
                                px={4}
                                borderBottom="1px solid"
                                borderColor="var(--ali-border)"
                              >
                                {shareholder.capital || '-'}
                              </Td>
                              <Td 
                                fontSize="13px" 
                                color="var(--ali-text-primary)"
                                py={3}
                                px={4}
                                borderBottom="1px solid"
                                borderColor="var(--ali-border)"
                              >
                                {shareholder.capital_actual || '-'}
                              </Td>
                              <Td 
                                fontSize="13px" 
                                color="var(--ali-text-primary)"
                                py={3}
                                px={4}
                                borderBottom="1px solid"
                                borderColor="var(--ali-border)"
                              >
                                {shareholder.ratio || '-'}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    )
  }

  // 第一步：搜索表单和企业列表
  return (
    <Card
      bg="white"
      borderRadius="4px"
      boxShadow="var(--ali-card-shadow)"
      _hover={{ boxShadow: 'var(--ali-card-shadow-hover)' }}
      transition="all 0.2s"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* 搜索表单 - ECS风格紧凑布局 */}
          <Box>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="500" color="var(--ali-text-primary)" mb={2}>
                {t('queryTool.enterprise.keywordLabel')}
              </FormLabel>
              <HStack spacing={2} maxW="600px">
                <Input
                  placeholder={t('queryTool.enterprise.keywordPlaceholder')}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  isDisabled={loading}
                  size="md"
                  borderRadius="4px"
                  borderColor="var(--ali-border)"
                  _focus={{
                    borderColor: 'var(--ali-primary)',
                    boxShadow: '0 0 0 2px var(--ali-primary-light)',
                  }}
                />
                <Button
                  colorScheme="blue"
                  leftIcon={<Search size={16} />}
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText={t('queryTool.enterprise.searching')}
                  size="md"
                  borderRadius="4px"
                  px={4}
                  flexShrink={0}
                >
                  {t('queryTool.enterprise.search')}
                </Button>
              </HStack>
              <FormHelperText fontSize="12px" color="red.500" mt={1} mb={0}>
                {t('queryTool.enterprise.chinaOnlyHint')}
              </FormHelperText>
            </FormControl>
          </Box>

          {/* 错误提示 */}
          {error && (
            <Alert status="error" borderRadius="4px" fontSize="14px">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* 加载状态 */}
          {loading && (
            <Box textAlign="center" py={12}>
              <Spinner size="xl" color="var(--ali-primary)" thickness="3px" />
              <Text mt={4} fontSize="14px" color="var(--ali-text-secondary)">
                {t('queryTool.enterprise.searching')}
              </Text>
            </Box>
          )}

          {/* 企业列表 - ECS风格表格 */}
          {enterpriseList.length > 0 && !loading && (
            <Box>
              <Divider my={4} borderColor="var(--ali-border)" />
              
              <HStack mb={3} justify="space-between">
                <Text fontSize="14px" fontWeight="500" color="var(--ali-text-secondary)">
                  {t('queryTool.enterprise.searchResults', { total })}
                </Text>
              </HStack>

              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr bg="var(--ali-bg-light)">
                      <Th 
                        fontSize="12px" 
                        fontWeight="600" 
                        color="var(--ali-text-primary)"
                        py={3}
                        px={4}
                        borderBottom="1px solid"
                        borderColor="var(--ali-border)"
                      >
                        {t('queryTool.enterprise.name')}
                      </Th>
                      <Th 
                        fontSize="12px" 
                        fontWeight="600" 
                        color="var(--ali-text-primary)"
                        py={3}
                        px={4}
                        borderBottom="1px solid"
                        borderColor="var(--ali-border)"
                      >
                        {t('queryTool.enterprise.creditCode')}
                      </Th>
                      <Th 
                        fontSize="12px" 
                        fontWeight="600" 
                        color="var(--ali-text-primary)"
                        py={3}
                        px={4}
                        borderBottom="1px solid"
                        borderColor="var(--ali-border)"
                      >
                        {t('queryTool.enterprise.legalRepresentative')}
                      </Th>
                      <Th 
                        fontSize="12px" 
                        fontWeight="600" 
                        color="var(--ali-text-primary)"
                        py={3}
                        px={4}
                        borderBottom="1px solid"
                        borderColor="var(--ali-border)"
                      >
                        {t('queryTool.enterprise.businessStatus')}
                      </Th>
                      <Th 
                        fontSize="12px" 
                        fontWeight="600" 
                        color="var(--ali-text-primary)"
                        py={3}
                        px={4}
                        borderBottom="1px solid"
                        borderColor="var(--ali-border)"
                      >
                        {t('queryTool.enterprise.address')}
                      </Th>
                      <Th 
                        fontSize="12px" 
                        fontWeight="600" 
                        color="var(--ali-text-primary)"
                        py={3}
                        px={4}
                        borderBottom="1px solid"
                        borderColor="var(--ali-border)"
                        width="100px"
                      >
                        {t('queryTool.enterprise.actions')}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {enterpriseList.map((enterprise: EnterpriseListItem, index: number) => (
                      <Tr 
                        key={enterprise.id || index}
                        _hover={{ bg: 'var(--ali-primary-light)' }}
                        transition="background 0.2s"
                        bg={index % 2 === 0 ? 'white' : 'var(--ali-bg-light)'}
                      >
                        <Td 
                          fontSize="13px" 
                          color="var(--ali-text-primary)"
                          py={3}
                          px={4}
                          borderBottom="1px solid"
                          borderColor="var(--ali-border)"
                        >
                          {enterprise.name || '-'}
                        </Td>
                        <Td 
                          fontSize="13px" 
                          color="var(--ali-text-primary)"
                          py={3}
                          px={4}
                          borderBottom="1px solid"
                          borderColor="var(--ali-border)"
                        >
                          {enterprise.credit_code || '-'}
                        </Td>
                        <Td 
                          fontSize="13px" 
                          color="var(--ali-text-primary)"
                          py={3}
                          px={4}
                          borderBottom="1px solid"
                          borderColor="var(--ali-border)"
                        >
                          {enterprise.legal_representative || '-'}
                        </Td>
                        <Td 
                          fontSize="13px" 
                          color="var(--ali-text-primary)"
                          py={3}
                          px={4}
                          borderBottom="1px solid"
                          borderColor="var(--ali-border)"
                        >
                          {enterprise.business_status ? (
                            <Badge
                              colorScheme={
                                enterprise.business_status.includes('存续') ||
                                enterprise.business_status.includes('在业')
                                  ? 'green'
                                  : 'gray'
                              }
                              fontSize="12px"
                              px={2}
                              py={1}
                              borderRadius="2px"
                            >
                              {enterprise.business_status}
                            </Badge>
                          ) : '-'}
                        </Td>
                        <Td 
                          fontSize="13px" 
                          color="var(--ali-text-primary)"
                          py={3}
                          px={4}
                          borderBottom="1px solid"
                          borderColor="var(--ali-border)"
                        >
                          <Text 
                            fontSize="13px" 
                            noOfLines={1}
                            title={enterprise.address || ''}
                          >
                            {enterprise.address || '-'}
                          </Text>
                        </Td>
                        <Td 
                          fontSize="13px" 
                          color="var(--ali-text-primary)"
                          py={3}
                          px={4}
                          borderBottom="1px solid"
                          borderColor="var(--ali-border)"
                        >
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => enterprise.id && handleSelectEnterprise(enterprise.id)}
                            borderRadius="4px"
                            fontSize="12px"
                            px={3}
                          >
                            {t('queryTool.enterprise.select')}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 无数据提示 */}
          {enterpriseList.length === 0 && !loading && keyword && (
            <Box textAlign="center" py={12}>
              <Text fontSize="14px" color="var(--ali-text-secondary)">
                {t('queryTool.enterprise.noResults')}
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
