# 图标库使用指南

项目现在支持两个图标库：

## 1. Lucide React（主要图标库）

已经在使用，风格现代统一。

```tsx
import { User, Home, Mail, Settings } from 'lucide-react'

<User className="h-5 w-5" />
```

## 2. React Icons（补充图标库）

包含多个图标库的集合，提供更多图标选择。

### 安装

```bash
npm install react-icons
```

### 可用的图标库

React Icons 包含以下图标库：

- **Font Awesome** (`react-icons/fa`)
- **Material Design** (`react-icons/md`)
- **Heroicons** (`react-icons/hi`, `react-icons/hi2`)
- **Feather** (`react-icons/fi`)
- **Ionicons** (`react-icons/io`, `react-icons/io5`)
- **Ant Design** (`react-icons/ai`)
- **Bootstrap** (`react-icons/bs`)
- **Remix Icon** (`react-icons/ri`)
- **Tabler Icons** (`react-icons/tb`)
- **更多...**

### 使用示例

```tsx
// Font Awesome
import { FaUser, FaHome, FaEnvelope } from 'react-icons/fa'

// Material Design
import { MdSettings, MdDashboard, MdEmail } from 'react-icons/md'

// Heroicons
import { HiOutlineUser, HiHome } from 'react-icons/hi'
import { Hi2User, Hi2Home } from 'react-icons/hi2'

// Feather
import { FiUser, FiHome } from 'react-icons/fi'

// Ionicons
import { IoMdSettings, IoIosHome } from 'react-icons/io'

// Ant Design
import { AiOutlineUser, AiFillHome } from 'react-icons/ai'

// Bootstrap
import { BsPerson, BsHouse } from 'react-icons/bs'

// Remix Icon
import { RiUserLine, RiHomeLine } from 'react-icons/ri'

// Tabler Icons
import { TbUser, TbHome } from 'react-icons/tb'
```

### 完整示例

```tsx
import { FaUser } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { HiOutlineHome } from 'react-icons/hi'

function MyComponent() {
  return (
    <div>
      <FaUser className="h-5 w-5 text-blue-500" />
      <MdEmail className="h-6 w-6 text-red-500" />
      <HiOutlineHome className="h-4 w-4 text-green-500" />
    </div>
  )
}
```

### 图标搜索

可以在以下网站搜索图标：
- https://react-icons.github.io/react-icons/
- 搜索时输入图标库前缀（如 `fa`, `md`, `hi`）和关键词

### 使用建议

1. **优先使用 Lucide React**：风格统一，项目已在使用
2. **需要特殊图标时使用 React Icons**：补充 Lucide 没有的图标
3. **保持风格一致**：在同一组件中尽量使用同一图标库
4. **图标大小**：使用 Tailwind 的 `h-*` 和 `w-*` 类控制大小

### 图标库对比

| 特性 | Lucide React | React Icons |
|------|-------------|-------------|
| 图标数量 | ~1000+ | 10000+ |
| 风格统一性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 包大小 | 较小 | 较大（可按需导入）|
| 使用场景 | 主要图标库 | 补充特殊图标 |

### 最佳实践

1. **导入优化**：React Icons 支持按需导入，只导入需要的图标
2. **类型安全**：两个库都支持 TypeScript
3. **样式控制**：使用 Tailwind CSS 类控制颜色和大小
4. **一致性**：在同一个功能模块中尽量使用同一图标库

