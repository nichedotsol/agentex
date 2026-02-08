'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export default function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block font-sans text-sm font-medium text-ax-text">
        {label}
        {required && <span className="text-ax-error ml-1">*</span>}
      </label>
      <motion.div
        initial={false}
        animate={{
          borderColor: error ? '#ef4444' : undefined
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="font-sans text-xs text-ax-error"
          >
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-sans text-xs text-ax-text-tertiary"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full px-4 py-2.5 bg-ax-bg/50 border rounded-lg
        text-ax-text font-sans text-sm
        outline-none transition-all duration-200
        placeholder:text-ax-text-tertiary
        focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20
        hover:border-ax-border-hover
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-ax-error focus:border-ax-error focus:ring-ax-error/20' : 'border-ax-border'}
        ${className}
      `}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        w-full px-4 py-2.5 bg-ax-bg/50 border rounded-lg
        text-ax-text font-sans text-sm
        outline-none transition-all duration-200
        placeholder:text-ax-text-tertiary resize-none
        focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20
        hover:border-ax-border-hover
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-ax-error focus:border-ax-error focus:ring-ax-error/20' : 'border-ax-border'}
        ${className}
      `}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`
        w-full px-4 py-2.5 bg-ax-bg/50 border rounded-lg
        text-ax-text font-sans text-sm
        outline-none transition-all duration-200
        focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20
        hover:border-ax-border-hover
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${error ? 'border-ax-error focus:border-ax-error focus:ring-ax-error/20' : 'border-ax-border'}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  )
}
