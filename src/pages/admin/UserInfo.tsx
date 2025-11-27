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
  Avatar,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Collapse,
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
  const headerBg = useColorModeValue('blue.500', 'blue.900')
  const cardShadow = useColorModeValue('sm', 'none')

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

  const handleCancelPassword = () => {
    setIsChangingPassword(false)
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: '',
    })
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
      handleCancelPassword()
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
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={4} color="gray.500" fontSize="lg">{t('userInfo.loading')}</Text>
      </Flex>
    )
  }

  if (!userDetail) {
    return (
      <Box p={8} textAlign="center">
        <VStack spacing={4}>
          <Box as={User} size={64} color="gray.300" />
          <Text color="gray.500" fontSize="lg">{t('userInfo.error.noData')}</Text>
        </VStack>
      </Box>
    )
  }

  const avatarUrl = userDetail.email 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetail.display_name || userDetail.username)}&background=random&color=fff&size=128`
    : undefined

  return (
    <Box w="full" bg="gray.50" minH="100%" pb={8}>
      {/* 头部 Hero 区域 */}
      <Box 
        bg={headerBg} 
        h="160px" 
        position="relative"
        mb="80px"
        borderRadius="0 0 20px 20px"
      >
        <Container maxW="container.xl" h="full">
          <Flex align="flex-end" h="full" pb={-10} position="relative" top="40px" px={4}>
            <HStack spacing={6} align="flex-end" w="full">
              <Box position="relative">
                <Avatar 
                  size="2xl" 
                  src={avatarUrl} 
                  name={userDetail.display_name || userDetail.username}
                  borderWidth="4px"
                  borderColor="white"
                  boxShadow="lg"
                  bg="gray.200"
                />
                {/* <IconButton
                  aria-label="Change Avatar"
                  icon={<Camera size={18} />}
                  size="sm"
                  position="absolute"
                  bottom="2px"
                  right="2px"
                  colorScheme="gray"
                  rounded="full"
                  shadow="md"
                /> */}
              </Box>
              
              <VStack align="flex-start" spacing={1} pb={2} flex={1}>
                <Heading size="lg" color="gray.800" mt={12}>
                  {userDetail.display_name || userDetail.username}
                </Heading>
                <HStack spacing={3}>
                  <Text color="gray.500" fontSize="md">@{userDetail.username}</Text>
                  <Badge 
                    colorScheme={userDetail.is_active ? "green" : "red"}
                    variant="subtle"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    {userDetail.is_active ? t('userInfo.basicInfo.active') : t('userInfo.basicInfo.inactive')}
                  </Badge>
                  {userDetail.roles.map(role => (
                    <Badge key={role.id} colorScheme="purple" variant="outline" px={2} borderRadius="full">
                      {role.name}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <HStack spacing={3} pb={2} alignSelf="flex-end" mb={2}>
                {!isEditing && (
                  <Button
                    leftIcon={<Edit size={18} />}
                    colorScheme="blue"
                    onClick={handleEdit}
                    shadow="md"
                  >
                    {t('userInfo.edit')}
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Button
                      leftIcon={<Save size={18} />}
                      colorScheme="blue"
                      onClick={handleSave}
                      isLoading={submitting}
                      shadow="md"
                    >
                      {t('userInfo.save')}
                    </Button>
                    <Button
                      leftIcon={<X size={18} />}
                      variant="white"
                      bg="white"
                      onClick={handleCancel}
                      shadow="md"
                    >
                      {t('userInfo.cancel')}
                    </Button>
                  </>
                )}
              </HStack>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" px={6}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* 左侧栏：主要信息 */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* 基本信息 */}
              <Card bg={bgColor} borderColor={borderColor} shadow={cardShadow} borderRadius="xl">
                <CardHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
                  <HStack>
                    <Box p={2} bg="blue.50" borderRadius="lg" color="blue.500">
                      <User size={20} />
                    </Box>
                    <Heading size="md">{t('userInfo.basicInfo.title')}</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        {t('userInfo.basicInfo.displayName')}
                      </FormLabel>
                      {isEditing ? (
                        <Input
                          value={formData.display_name || ''}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          placeholder={t('userInfo.basicInfo.displayName')}
                        />
                      ) : (
                        <Text fontSize="md" fontWeight="medium">{userDetail.display_name || '-'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        {t('userInfo.basicInfo.username')}
                      </FormLabel>
                      <Input 
                        value={userDetail.username} 
                        isReadOnly 
                        bg="gray.50" 
                        border="none" 
                        _hover={{}} 
                        cursor="default"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        {t('userInfo.basicInfo.email')}
                      </FormLabel>
                      <Input 
                        value={userDetail.email || ''} 
                        isReadOnly 
                        bg="gray.50" 
                        border="none" 
                        _hover={{}}
                        cursor="default"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        {t('userInfo.basicInfo.phone')}
                      </FormLabel>
                      {isEditing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t('userInfo.basicInfo.phone')}
                        />
                      ) : (
                        <Text fontSize="md" fontWeight="medium">{userDetail.phone || '-'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        {t('userInfo.basicInfo.gender')}
                      </FormLabel>
                      {isEditing ? (
                        <Select
                          value={formData.gender || ''}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="male">{t('userInfo.basicInfo.male')}</option>
                          <option value="female">{t('userInfo.basicInfo.female')}</option>
                          <option value="other">{t('userInfo.basicInfo.other')}</option>
                        </Select>
                      ) : (
                        <Text fontSize="md" fontWeight="medium">
                          {userDetail.gender ? t(`userInfo.basicInfo.${userDetail.gender}`) : '-'}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        {t('userInfo.basicInfo.organization')}
                      </FormLabel>
                      <HStack>
                        <Building2 size={16} color="gray" />
                        <Text fontSize="md">{userDetail.primary_organization_name || '-'}</Text>
                      </HStack>
                    </FormControl>

                    <FormControl gridColumn={{ md: 'span 2' }}>
                      <FormLabel fontSize="sm" color="gray.500">
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
                        <Text fontSize="md" color="gray.700">{userDetail.bio || '-'}</Text>
                      )}
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* 个人简介/时间线 */}
              <Card bg={bgColor} borderColor={borderColor} shadow={cardShadow} borderRadius="xl">
                <CardHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
                  <HStack>
                    <Box p={2} bg="orange.50" borderRadius="lg" color="orange.500">
                      <Clock size={20} />
                    </Box>
                    <Heading size="md">{t('userInfo.timeline.title')}</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>{t('userInfo.timeline.createdAt')}</Text>
                      <Text fontWeight="medium">{formatDate(userDetail.created_at)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>{t('userInfo.timeline.updatedAt')}</Text>
                      <Text fontWeight="medium">{formatDate(userDetail.updated_at)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>{t('userInfo.timeline.lastLoginAt')}</Text>
                      <Text fontWeight="medium">{formatDate(userDetail.last_login_at)}</Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* 右侧栏：联系方式和安全 */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* 联系方式 */}
              <Card bg={bgColor} borderColor={borderColor} shadow={cardShadow} borderRadius="xl">
                <CardHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
                  <HStack>
                    <Box p={2} bg="green.50" borderRadius="lg" color="green.500">
                      <MessageSquare size={20} />
                    </Box>
                    <Heading size="md">{t('userInfo.contact.title')}</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <HStack mb={1}>
                        <Phone size={14} className="text-gray-400" />
                        <FormLabel fontSize="xs" color="gray.500" m={0}>
                          {t('userInfo.contact.contactPhone')}
                        </FormLabel>
                      </HStack>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={formData.contact_phone || ''}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        />
                      ) : (
                        <Text fontSize="sm">{userDetail.contact_phone || '-'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <HStack mb={1}>
                        <MessageCircle size={14} className="text-gray-400" />
                        <FormLabel fontSize="xs" color="gray.500" m={0}>
                          {t('userInfo.contact.whatsapp')}
                        </FormLabel>
                      </HStack>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={formData.whatsapp || ''}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                      ) : (
                        <Text fontSize="sm">{userDetail.whatsapp || '-'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <HStack mb={1}>
                        <MessageCircle size={14} className="text-gray-400" />
                        <FormLabel fontSize="xs" color="gray.500" m={0}>
                          {t('userInfo.contact.wechat')}
                        </FormLabel>
                      </HStack>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={formData.wechat || ''}
                          onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                        />
                      ) : (
                        <Text fontSize="sm">{userDetail.wechat || '-'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <HStack mb={1}>
                        <MapPin size={14} className="text-gray-400" />
                        <FormLabel fontSize="xs" color="gray.500" m={0}>
                          {t('userInfo.contact.address')}
                        </FormLabel>
                      </HStack>
                      {isEditing ? (
                        <Textarea
                          size="sm"
                          rows={2}
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      ) : (
                        <Text fontSize="sm">{userDetail.address || '-'}</Text>
                      )}
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* 安全设置 */}
              <Card bg={bgColor} borderColor={borderColor} shadow={cardShadow} borderRadius="xl">
                <CardHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Box p={2} bg="red.50" borderRadius="lg" color="red.500">
                        <Shield size={20} />
                      </Box>
                      <Heading size="md">{t('userInfo.password.title')}</Heading>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {!isChangingPassword ? (
                    <Button
                      w="full"
                      leftIcon={<Lock size={16} />}
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      {t('userInfo.password.changePassword')}
                    </Button>
                  ) : (
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">
                          {t('userInfo.password.oldPassword')}
                        </FormLabel>
                        <InputGroup size="sm">
                          <Input
                            type={showPasswords.old ? 'text' : 'password'}
                            value={passwordData.old_password}
                            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPasswords.old ? 'Hide' : 'Show'}
                              icon={showPasswords.old ? <EyeOff size={12} /> : <Eye size={12} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">
                          {t('userInfo.password.newPassword')}
                        </FormLabel>
                        <InputGroup size="sm">
                          <Input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPasswords.new ? 'Hide' : 'Show'}
                              icon={showPasswords.new ? <EyeOff size={12} /> : <Eye size={12} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <Text fontSize="xs" color="gray.400" mt={1}>
                          {t('userInfo.password.passwordRequirement')}
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">
                          {t('userInfo.password.confirmPassword')}
                        </FormLabel>
                        <InputGroup size="sm">
                          <Input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPasswords.confirm ? 'Hide' : 'Show'}
                              icon={showPasswords.confirm ? <EyeOff size={12} /> : <Eye size={12} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <HStack w="full" spacing={2}>
                        <Button
                          size="sm"
                          flex={1}
                          variant="ghost"
                          onClick={handleCancelPassword}
                        >
                          {t('userInfo.cancel')}
                        </Button>
                        <Button
                          size="sm"
                          flex={1}
                          colorScheme="blue"
                          onClick={handleChangePassword}
                          isLoading={changingPassword}
                        >
                          {t('userInfo.save')}
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default UserInfo
