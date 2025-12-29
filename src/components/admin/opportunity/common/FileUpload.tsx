/**
 * 文件上传组件
 * 支持拖拽上传和点击上传
 */
import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  HStack,
  IconButton,
  Progress,
} from '@chakra-ui/react'
import { Upload, X, File } from 'lucide-react'

export interface UploadedFile {
  id: string
  name: string
  size: number
  url?: string
  file?: File
}

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  onUpload?: (files: UploadedFile[]) => void
  uploadedFiles?: UploadedFile[]
  onRemove?: (fileId: string) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 10,
  onUpload,
  uploadedFiles = [],
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles: UploadedFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > maxSize * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 ${maxSize}MB 限制`)
        continue
      }
      validFiles.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        file,
      })
    }

    if (validFiles.length > 0) {
      setUploading(true)
      setUploadProgress(0)
      
      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // 实际项目中这里应该调用上传API
      setTimeout(() => {
        clearInterval(interval)
        setUploadProgress(100)
        setUploading(false)
        onUpload?.(validFiles)
      }, 1000)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <VStack spacing={3} align="stretch">
      <Box
        border="2px dashed"
        borderColor={isDragging ? 'var(--ali-primary)' : 'var(--ali-border)'}
        borderRadius="4px"
        p={4}
        textAlign="center"
        bg={isDragging ? 'var(--ali-primary-light)' : 'transparent'}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        transition="all 0.2s"
      >
        <VStack spacing={2}>
          <Upload size={24} color="var(--ali-text-secondary)" />
          <Text fontSize="11px" color="var(--ali-text-secondary)">
            拖拽文件到此处或
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => fileInputRef.current?.click()}
            fontSize="11px"
            h="28px"
          >
            选择文件
          </Button>
          <Text fontSize="10px" color="var(--ali-text-secondary)">
            支持单个文件最大 {maxSize}MB
          </Text>
        </VStack>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </Box>

      {uploading && (
        <Box>
          <Progress value={uploadProgress} size="sm" colorScheme="blue" />
          <Text fontSize="10px" color="var(--ali-text-secondary)" mt={1}>
            上传中... {uploadProgress}%
          </Text>
        </Box>
      )}

      {uploadedFiles.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontSize="11px" fontWeight="500" color="var(--ali-text-secondary)">
            已上传文件 ({uploadedFiles.length})
          </Text>
          {uploadedFiles.map((file) => (
            <HStack
              key={file.id}
              p={2}
              bg="var(--ali-bg-light)"
              borderRadius="4px"
              justify="space-between"
            >
              <HStack spacing={2}>
                <File size={14} color="var(--ali-text-secondary)" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="11px" color="var(--ali-text-primary)">
                    {file.name}
                  </Text>
                  <Text fontSize="10px" color="var(--ali-text-secondary)">
                    {formatFileSize(file.size)}
                  </Text>
                </VStack>
              </HStack>
              {onRemove && (
                <IconButton
                  aria-label="删除文件"
                  icon={<X size={14} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => onRemove(file.id)}
                />
              )}
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  )
}
