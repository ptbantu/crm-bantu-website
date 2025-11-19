/**
 * Chakra UI Provider
 * 配置 Chakra UI 主题和全局样式
 */
import { ChakraProvider as BaseChakraProvider, extendTheme } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { IconName } from '@/types/react-icons'

// 自定义主题配置
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
      variants: {
        solid: {
          _hover: {
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
        },
      },
    },
    Table: {
      baseStyle: {
        th: {
          fontWeight: 'semibold',
          textTransform: 'none',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
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

