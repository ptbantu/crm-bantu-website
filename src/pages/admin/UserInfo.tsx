/**
 * 用户信息页面
 * 显示当前登录用户的详细信息
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  MessageSquare,
  MessageCircle
} from 'lucide-react'
import { getUserDetail } from '@/api/users'
import { getCurrentUser } from '@/api/auth'
import { UserDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Spinner,
  useColorModeValue,
  Divider,
  Flex,
} from '@chakra-ui/react'

const UserInfo = () => {
  const { t } = useTranslation()
  const { showError } = useToast()
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const currentUser = getCurrentUser()
        if (!currentUser || !currentUser.id) {
          showError(t('userInfo.error.noUser'))
          setLoading(false)
          return
        }

        const detail = await getUserDetail(currentUser.id)
        setUserDetail(detail)
      } catch (error: any) {
        console.error('Failed to load user info:', error)
        showError(error.message || t('userInfo.error.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Box w="full">
        <PageHeader
          icon={User}
          title={t('userInfo.title')}
          subtitle={t('userInfo.subtitle')}
        />
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('userInfo.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      </Box>
    )
  }

  if (!userDetail) {
    return (
      <Box w="full">
        <PageHeader
          icon={User}
          title={t('userInfo.title')}
          subtitle={t('userInfo.subtitle')}
        />
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Box as={User} size={48} color="gray.400" />
              <Text color="gray.500" fontSize="sm">{t('userInfo.error.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    )
  }

  return (
    <Box w="full">
      {/* 页面头部 */}
      <PageHeader
        icon={User}
        title={t('userInfo.title')}
        subtitle={t('userInfo.subtitle')}
      />

      {/* 基本信息卡片 */}
      <Card bg={bgColor} borderColor={borderColor} mb={3}>
        <CardHeader pb={3}>
          <HStack spacing={2}>
            <Box as={User} size={4} />
            <Heading size="sm">{t('userInfo.basicInfo.title')}</Heading>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={0.5}>
                {t('userInfo.basicInfo.username')}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.900">
                {userDetail.username}
              </Text>
            </Box>
            <HStack align="start" spacing={2}>
              <Box as={Mail} size={4} color="gray.400" mt={0.5} />
              <Box flex={1}>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  {t('userInfo.basicInfo.email')}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.email || '-'}
                </Text>
              </Box>
            </HStack>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={0.5}>
                {t('userInfo.basicInfo.displayName')}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.900">
                {userDetail.display_name || '-'}
              </Text>
            </Box>
            <HStack align="start" spacing={2}>
              <Box as={Phone} size={4} color="gray.400" mt={0.5} />
              <Box flex={1}>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  {t('userInfo.basicInfo.phone')}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.phone || '-'}
                </Text>
              </Box>
            </HStack>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={0.5}>
                {t('userInfo.basicInfo.status')}
              </Text>
              <HStack spacing={1}>
                {userDetail.is_active ? (
                  <>
                    <Box as={CheckCircle2} size={3.5} color="green.600" />
                    <Badge colorScheme="green" fontSize="xs">
                      {t('userInfo.basicInfo.active')}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Box as={XCircle} size={3.5} color="red.600" />
                    <Badge colorScheme="red" fontSize="xs">
                      {t('userInfo.basicInfo.inactive')}
                    </Badge>
                  </>
                )}
              </HStack>
            </Box>
            <HStack align="start" spacing={2}>
              <Box as={Building2} size={4} color="gray.400" mt={0.5} />
              <Box flex={1}>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  {t('userInfo.basicInfo.organization')}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.primary_organization_name || '-'}
                </Text>
              </Box>
            </HStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* 角色信息 */}
      {userDetail.roles && userDetail.roles.length > 0 && (
        <Card bg={bgColor} borderColor={borderColor} mb={3}>
          <CardHeader pb={3}>
            <HStack spacing={2}>
              <Box as={Shield} size={4} />
              <Heading size="sm">{t('userInfo.roles.title')}</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <HStack spacing={2} flexWrap="wrap">
              {userDetail.roles.map((role) => (
                <Badge
                  key={role.id}
                  colorScheme="blue"
                  fontSize="xs"
                  px={2.5}
                  py={1}
                  borderRadius="lg"
                >
                  <HStack spacing={1.5}>
                    <Box as={Shield} size={3.5} />
                    <Text>{role.name}</Text>
                    <Text opacity={0.7}>({role.code})</Text>
                  </HStack>
                </Badge>
              ))}
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* 联系信息 */}
      {(userDetail.contact_phone || userDetail.whatsapp || userDetail.wechat || userDetail.address) && (
        <Card bg={bgColor} borderColor={borderColor} mb={3}>
          <CardHeader pb={3}>
            <HStack spacing={2}>
              <Box as={MessageSquare} size={4} />
              <Heading size="sm">{t('userInfo.contact.title')}</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {userDetail.contact_phone && (
                <HStack align="start" spacing={2}>
                  <Box as={Phone} size={4} color="gray.400" mt={0.5} />
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.500" mb={0.5}>
                      {t('userInfo.contact.contactPhone')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {userDetail.contact_phone}
                    </Text>
                  </Box>
                </HStack>
              )}
              {userDetail.whatsapp && (
                <HStack align="start" spacing={2}>
                  <Box as={MessageCircle} size={4} color="gray.400" mt={0.5} />
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.500" mb={0.5}>
                      {t('userInfo.contact.whatsapp')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {userDetail.whatsapp}
                    </Text>
                  </Box>
                </HStack>
              )}
              {userDetail.wechat && (
                <HStack align="start" spacing={2}>
                  <Box as={MessageCircle} size={4} color="gray.400" mt={0.5} />
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.500" mb={0.5}>
                      {t('userInfo.contact.wechat')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {userDetail.wechat}
                    </Text>
                  </Box>
                </HStack>
              )}
              {userDetail.address && (
                <HStack align="start" spacing={2} gridColumn={{ md: 'span 2' }}>
                  <Box as={MapPin} size={4} color="gray.400" mt={0.5} />
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.500" mb={0.5}>
                      {t('userInfo.contact.address')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {userDetail.address}
                    </Text>
                  </Box>
                </HStack>
              )}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* 时间信息 */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader pb={3}>
          <HStack spacing={2}>
            <Box as={Clock} size={4} />
            <Heading size="sm">{t('userInfo.timeline.title')}</Heading>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <HStack align="start" spacing={2}>
              <Box as={Calendar} size={4} color="gray.400" mt={0.5} />
              <Box flex={1}>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  {t('userInfo.timeline.createdAt')}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {formatDate(userDetail.created_at)}
                </Text>
              </Box>
            </HStack>
            <HStack align="start" spacing={2}>
              <Box as={Calendar} size={4} color="gray.400" mt={0.5} />
              <Box flex={1}>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  {t('userInfo.timeline.updatedAt')}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {formatDate(userDetail.updated_at)}
                </Text>
              </Box>
            </HStack>
            {userDetail.last_login_at && (
              <HStack align="start" spacing={2}>
                <Box as={Clock} size={4} color="gray.400" mt={0.5} />
                <Box flex={1}>
                  <Text fontSize="xs" color="gray.500" mb={0.5}>
                    {t('userInfo.timeline.lastLoginAt')}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {formatDate(userDetail.last_login_at)}
                  </Text>
                </Box>
              </HStack>
            )}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  )
}

export default UserInfo

