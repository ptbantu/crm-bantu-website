/**
 * 用户信息页面
 * 显示当前登录用户的详细信息，支持编辑个人信息和修改密码
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
  MessageCircle,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { getUserDetail, updateUser, changePassword } from '@/api/users'
import { getCurrentUser } from '@/api/auth'
import { UserDetail, UpdateUserRequest } from '@/api/types'
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
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'

const UserInfo = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState<UpdateUserRequest>({})
  
  // 密码表单数据
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    loadUserInfo()
  }, [])

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
      // 初始化表单数据
      setFormData({
        display_name: detail.display_name || '',
        phone: detail.phone || '',
        contact_phone: detail.contact_phone || '',
        address: detail.address || '',
        whatsapp: detail.whatsapp || '',
        wechat: detail.wechat || '',
        gender: detail.gender || '',
        bio: detail.bio || '',
      })
    } catch (error: any) {
      console.error('Failed to load user info:', error)
      showError(error.message || t('userInfo.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsChangingPassword(false)
    // 重置表单数据
    if (userDetail) {
      setFormData({
        display_name: userDetail.display_name || '',
        phone: userDetail.phone || '',
        contact_phone: userDetail.contact_phone || '',
        address: userDetail.address || '',
        whatsapp: userDetail.whatsapp || '',
        wechat: userDetail.wechat || '',
        gender: userDetail.gender || '',
        bio: userDetail.bio || '',
      })
    }
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: '',
    })
  }

  const handleSave = async () => {
    if (!userDetail) return
    
    setSubmitting(true)
    try {
      await updateUser(userDetail.id, formData)
      showSuccess(t('userInfo.success.updateSuccess'))
      setIsEditing(false)
      await loadUserInfo()
    } catch (error: any) {
      showError(error.message || t('userInfo.error.updateFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    if (!userDetail) return
    
    // 验证
    if (!passwordData.old_password) {
      showError(t('userInfo.password.oldPasswordRequired'))
      return
    }
    if (!passwordData.new_password) {
      showError(t('userInfo.password.newPasswordRequired'))
      return
    }
    if (passwordData.new_password.length < 8) {
      showError(t('userInfo.password.passwordTooShort'))
      return
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError(t('userInfo.password.passwordMismatch'))
      return
    }
    
    // 验证密码强度
    const hasLetter = /[a-zA-Z]/.test(passwordData.new_password)
    const hasDigit = /\d/.test(passwordData.new_password)
    if (!hasLetter || !hasDigit) {
      showError(t('userInfo.password.passwordRequirement'))
      return
    }
    
    setChangingPassword(true)
    try {
      await changePassword(userDetail.id, passwordData.old_password, passwordData.new_password)
      showSuccess(t('userInfo.success.passwordChangeSuccess'))
      setIsChangingPassword(false)
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error: any) {
      showError(error.message || t('userInfo.error.passwordChangeFailed'))
    } finally {
      setChangingPassword(false)
    }
  }

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
      <Flex justify="space-between" align="center" mb={4}>
        <PageHeader
          icon={User}
          title={t('userInfo.title')}
          subtitle={t('userInfo.subtitle')}
        />
        {!isEditing && (
          <Button
            leftIcon={<Edit size={16} />}
            colorScheme="blue"
            onClick={handleEdit}
          >
            {t('userInfo.edit')}
          </Button>
        )}
      </Flex>

      {/* 基本信息卡片 */}
      <Card bg={bgColor} borderColor={borderColor} mb={4} boxShadow="sm">
        <CardHeader pb={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Box as={User} size={4} />
              <Heading size="sm">{t('userInfo.basicInfo.title')}</Heading>
            </HStack>
            {isEditing && (
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<Save size={14} />}
                  colorScheme="blue"
                  onClick={handleSave}
                  isLoading={submitting}
                >
                  {t('userInfo.save')}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<X size={14} />}
                  variant="outline"
                  onClick={handleCancel}
                >
                  {t('userInfo.cancel')}
                </Button>
              </HStack>
            )}
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* 用户名 - 只读 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.username')}
              </FormLabel>
              <Input
                value={userDetail.username}
                isReadOnly
                bg={useColorModeValue('gray.50', 'gray.700')}
                cursor="not-allowed"
              />
            </FormControl>

            {/* 邮箱 - 只读 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.email')}
              </FormLabel>
              <Input
                value={userDetail.email || ''}
                isReadOnly
                bg={useColorModeValue('gray.50', 'gray.700')}
                cursor="not-allowed"
              />
            </FormControl>

            {/* 显示名称 - 可编辑 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.displayName')}
              </FormLabel>
              {isEditing ? (
                <Input
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder={t('userInfo.basicInfo.displayName')}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.display_name || '-'}
                </Text>
              )}
            </FormControl>

            {/* 手机号 - 可编辑 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.phone')}
              </FormLabel>
              {isEditing ? (
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('userInfo.basicInfo.phone')}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.phone || '-'}
                </Text>
              )}
            </FormControl>

            {/* 性别 - 可编辑 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.gender')}
              </FormLabel>
              {isEditing ? (
                <Select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  placeholder={t('userInfo.basicInfo.gender')}
                >
                  <option value="male">{t('userInfo.basicInfo.male')}</option>
                  <option value="female">{t('userInfo.basicInfo.female')}</option>
                  <option value="other">{t('userInfo.basicInfo.other')}</option>
                </Select>
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.gender 
                    ? t(`userInfo.basicInfo.${userDetail.gender}`)
                    : '-'}
                </Text>
              )}
            </FormControl>

            {/* 状态 - 只读 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.status')}
              </FormLabel>
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
            </FormControl>

            {/* 组织 - 只读 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.organization')}
              </FormLabel>
              <Input
                value={userDetail.primary_organization_name || ''}
                isReadOnly
                bg={useColorModeValue('gray.50', 'gray.700')}
                cursor="not-allowed"
              />
            </FormControl>

            {/* 个人简介 - 可编辑 */}
            <FormControl gridColumn={{ md: 'span 2' }}>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.basicInfo.bio')}
              </FormLabel>
              {isEditing ? (
                <Textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t('userInfo.basicInfo.bio')}
                  rows={3}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.bio || '-'}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* 联系信息卡片 */}
      <Card bg={bgColor} borderColor={borderColor} mb={4} boxShadow="sm">
        <CardHeader pb={3}>
          <HStack spacing={2}>
            <Box as={MessageSquare} size={4} />
            <Heading size="sm">{t('userInfo.contact.title')}</Heading>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* 联系电话 - 可编辑 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.contact.contactPhone')}
              </FormLabel>
              {isEditing ? (
                <Input
                  value={formData.contact_phone || ''}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder={t('userInfo.contact.contactPhone')}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.contact_phone || '-'}
                </Text>
              )}
            </FormControl>

            {/* WhatsApp - 可编辑 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.contact.whatsapp')}
              </FormLabel>
              {isEditing ? (
                <Input
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder={t('userInfo.contact.whatsapp')}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.whatsapp || '-'}
                </Text>
              )}
            </FormControl>

            {/* 微信 - 可编辑 */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.contact.wechat')}
              </FormLabel>
              {isEditing ? (
                <Input
                  value={formData.wechat || ''}
                  onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                  placeholder={t('userInfo.contact.wechat')}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.wechat || '-'}
                </Text>
              )}
            </FormControl>

            {/* 地址 - 可编辑 */}
            <FormControl gridColumn={{ md: 'span 2' }}>
              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                {t('userInfo.contact.address')}
              </FormLabel>
              {isEditing ? (
                <Textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('userInfo.contact.address')}
                  rows={2}
                />
              ) : (
                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                  {userDetail.address || '-'}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* 密码修改卡片 */}
      <Card bg={bgColor} borderColor={borderColor} mb={4} boxShadow="sm">
        <CardHeader pb={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Box as={Lock} size={4} />
              <Heading size="sm">{t('userInfo.password.title')}</Heading>
            </HStack>
            {!isChangingPassword && (
              <Button
                size="sm"
                leftIcon={<Lock size={14} />}
                colorScheme="purple"
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                {t('userInfo.password.changePassword')}
              </Button>
            )}
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          {isChangingPassword ? (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>
                  {t('userInfo.password.oldPassword')}
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.old ? 'text' : 'password'}
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    placeholder={t('userInfo.password.oldPassword')}
                  />
                  <InputRightElement width="3rem">
                    <IconButton
                      aria-label={showPasswords.old ? 'Hide password' : 'Show password'}
                      icon={showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>
                  {t('userInfo.password.newPassword')}
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder={t('userInfo.password.newPassword')}
                  />
                  <InputRightElement width="3rem">
                    <IconButton
                      aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                      icon={showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    />
                  </InputRightElement>
                </InputGroup>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {t('userInfo.password.passwordRequirement')}
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.500" mb={1}>
                  {t('userInfo.password.confirmPassword')}
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder={t('userInfo.password.confirmPassword')}
                  />
                  <InputRightElement width="3rem">
                    <IconButton
                      aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                      icon={showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <HStack spacing={2} justify="flex-end">
                <Button
                  size="sm"
                  leftIcon={<Save size={14} />}
                  colorScheme="purple"
                  onClick={handleChangePassword}
                  isLoading={changingPassword}
                >
                  {t('userInfo.save')}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<X size={14} />}
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({
                      old_password: '',
                      new_password: '',
                      confirm_password: '',
                    })
                  }}
                >
                  {t('userInfo.cancel')}
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Text fontSize="sm" color="gray.500">
              {t('userInfo.password.changePassword')}
            </Text>
          )}
        </CardBody>
      </Card>

      {/* 角色信息 */}
      {userDetail.roles && userDetail.roles.length > 0 && (
        <Card bg={bgColor} borderColor={borderColor} mb={4} boxShadow="sm">
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

      {/* 时间信息 */}
      <Card bg={bgColor} borderColor={borderColor} boxShadow="sm">
        <CardHeader pb={3}>
          <HStack spacing={2}>
            <Box as={Clock} size={4} />
            <Heading size="sm">{t('userInfo.timeline.title')}</Heading>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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
