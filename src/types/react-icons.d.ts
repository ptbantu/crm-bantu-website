/**
 * React Icons 类型定义
 * 为 react-icons 提供类型支持
 */

// 重新导出 react-icons/ai 中的所有图标
export * from 'react-icons/ai'

// IconName 类型 - 用于动态图标选择
// 注意：react-icons 不提供内置的 IconName 类型
// 如果需要类型安全，建议直接导入具体的图标组件
export type IconName = string

