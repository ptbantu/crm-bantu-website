/**
 * 高密度数据表格组件
 * ECS风格的高密度表格
 */
import React from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
} from '@chakra-ui/react'

export interface Column<T> {
  key: string
  label: string
  width?: string
  render?: (value: any, row: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = '暂无数据',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th
                key={column.key}
                fontSize="11px"
                fontWeight="600"
                color="var(--ali-text-secondary)"
                textTransform="none"
                borderBottom="1px solid var(--ali-border)"
                px={2}
                py={2}
                width={column.width}
              >
                {column.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" py={8}>
                <Text fontSize="12px" color="var(--ali-text-secondary)">
                  {emptyMessage}
                </Text>
              </Td>
            </Tr>
          ) : (
            data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                cursor={onRowClick ? 'pointer' : 'default'}
                _hover={onRowClick ? { bg: 'var(--ali-bg-light)' } : {}}
                borderBottom="1px solid var(--ali-border)"
              >
                {columns.map((column) => (
                  <Td
                    key={column.key}
                    fontSize="12px"
                    color="var(--ali-text-primary)"
                    px={2}
                    py={2}
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key] ?? '-'}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
