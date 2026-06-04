import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className 工具函数
 * shadcn/ui 惯例：clsx 处理条件类名 + tailwind-merge 处理冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
