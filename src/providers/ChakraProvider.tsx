/**
 * Chakra UI Provider
 * 配置 Chakra UI 主题和全局样式
 */
import { ChakraProvider as BaseChakraProvider, extendTheme } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { IconName } from '@/types/react-icons'

// 阿里云ECS风格主题配置
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    // 保留原有primary色系（向后兼容）
    primary: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF',
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
    // 阿里云ECS风格色彩体系
    ali: {
      primary: '#1890FF',
      'primary-hover': '#40A9FF',
      'primary-active': '#096DD9',
      'primary-light': '#E6F7FF',
      orange: '#FF6A00',
      'orange-hover': '#FF8533',
      'tech-blue': '#1890FF',
      success: '#52C41A',
      'success-hover': '#73D13D',
      warning: '#FAAD14',
      'warning-hover': '#FFC53D',
      error: '#FF4D4F',
      'error-hover': '#FF7875',
      'dark-bg': '#001529',
      'dark-hover': '#112240',
      'dark-active': '#1890FF',
      'text-primary': '#262626',
      'text-secondary': '#8C8C8C',
      'text-disabled': '#BFBFBF',
      'bg-gray': '#F5F5F5',
      'bg-light': '#FAFAFA',
      border: '#F0F0F0',
      'border-dark': '#D9D9D9',
    },
  },
  fonts: {
    body: "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    heading: "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },
  fontSizes: {
    'ali-base': '14px',
    'ali-sm': '12px',
    'ali-lg': '16px',
    'ali-xl': '20px',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
      baseStyle: {
        borderRadius: '4px',
        fontWeight: 'normal',
        fontSize: '14px',
        lineHeight: '1.5715',
      },
      variants: {
        solid: {
          bg: 'ali.primary',
          color: 'white',
          _hover: {
            bg: 'ali.primary-hover',
            transform: 'none',
            boxShadow: 'none',
          },
          _active: {
            bg: 'ali.primary-active',
          },
        },
        outline: {
          borderColor: 'ali.border-dark',
          color: 'ali.text-primary',
          bg: 'transparent',
          _hover: {
            bg: 'ali.bg-light',
            borderColor: 'ali.primary',
            color: 'ali.primary',
          },
        },
        ghost: {
          color: 'ali.primary',
          _hover: {
            bg: 'ali.primary-light',
          },
        },
      },
      sizes: {
        md: {
          h: '32px',
          px: '16px',
          fontSize: '14px',
        },
        sm: {
          h: '24px',
          px: '8px',
          fontSize: '12px',
        },
        lg: {
          h: '40px',
          px: '24px',
          fontSize: '16px',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: '4px',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          border: 'none',
        },
        header: {
          borderBottom: '1px solid',
          borderColor: 'ali.border',
          pb: '16px',
          mb: '16px',
        },
        body: {
          p: '16px',
        },
      },
      variants: {
        elevated: {
          container: {
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          },
        },
      },
    },
    Table: {
      baseStyle: {
        th: {
          fontWeight: '600',
          textTransform: 'none',
          bg: 'ali.bg-light',
          color: 'ali.text-primary',
          fontSize: '14px',
          py: '12px',
          borderBottom: '1px solid',
          borderColor: 'ali.border',
        },
        td: {
          fontSize: '14px',
          color: 'ali.text-primary',
          py: '16px',
          borderBottom: '1px solid',
          borderColor: 'ali.border',
        },
        tbody: {
          tr: {
            _hover: {
              bg: 'ali.primary-light',
            },
            _even: {
              bg: 'ali.bg-light',
            },
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          h: '32px',
          fontSize: '14px',
          borderColor: 'ali.border-dark',
          _focus: {
            borderColor: 'ali.primary',
            boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          h: '32px',
          fontSize: '14px',
          borderColor: 'ali.border-dark',
          _focus: {
            borderColor: 'ali.primary',
            boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
          },
        },
      },
      sizes: {
        md: {
          field: {
            h: '32px',
            fontSize: '14px',
          },
        },
        sm: {
          field: {
            h: '24px',
            fontSize: '12px',
          },
        },
        lg: {
          field: {
            h: '40px',
            fontSize: '16px',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: '4px',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'ali.bg-gray',
        fontFamily: "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: '14px',
        lineHeight: '1.5715',
        color: 'ali.text-primary',
      },
    },
  },
})

interface ChakraProviderProps {
  children: ReactNode
}

export const ChakraProvider = ({ children }: ChakraProviderProps) => {
  return (
    <BaseChakraProvider theme={theme}>
      {children}
    </BaseChakraProvider>
  )
}

