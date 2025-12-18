/**
 * 敏感信息输入框组件
 * 支持显示/隐藏敏感信息
 */
import { useState } from 'react'
import { Input, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react'
import { Eye, EyeOff } from 'lucide-react'

interface SensitiveInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  isRequired?: boolean
}

export const SensitiveInput = ({
  value,
  onChange,
  placeholder,
  isDisabled = false,
  isRequired = false,
}: SensitiveInputProps) => {
  const [show, setShow] = useState(false)

  return (
    <InputGroup>
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isRequired={isRequired}
      />
      <InputRightElement>
        <IconButton
          aria-label={show ? '隐藏' : '显示'}
          icon={show ? <EyeOff size={16} /> : <Eye size={16} />}
          onClick={() => setShow(!show)}
          variant="ghost"
          size="sm"
        />
      </InputRightElement>
    </InputGroup>
  )
}
