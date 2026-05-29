import React, { forwardRef, useId, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  function FloatingLabelInput(
    { label, error, hint, type, value, onChange, onFocus, onBlur, ...rest },
    ref
  ) {
    const id = useId()
    const internalRef = useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    // Determine whether the input has a value (controlled or uncontrolled)
    const hasValue =
      value !== undefined ? String(value) !== '' : (internalRef.current?.value ?? '') !== ''

    const isFloated = isFocused || hasValue

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
    }

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: '52px',
      padding: '24px 16px 8px',
      paddingRight: isPassword ? '48px' : '16px',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      fontSize: '17px',
      fontFamily: 'var(--font-text)',
      border: `1.5px solid ${error ? 'var(--color-red)' : isFocused ? 'var(--color-blue)' : 'transparent'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    }

    const labelStyle: React.CSSProperties = {
      position: 'absolute',
      left: '16px',
      pointerEvents: 'none',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      ...(isFloated
        ? {
            top: '8px',
            transform: 'translateY(0)',
            fontSize: '11px',
            color: error
              ? 'var(--color-red)'
              : isFocused
                ? 'var(--color-blue)'
                : 'var(--text-secondary)',
          }
        : {
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '17px',
            color: 'var(--text-secondary)',
          }),
    }

    const toggleButtonStyle: React.CSSProperties = {
      position: 'absolute',
      right: '4px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      padding: 0,
    }

    const footerStyle: React.CSSProperties = {
      marginTop: '4px',
      fontSize: '13px',
      lineHeight: '1.4',
    }

    // Merge forwardRef with internalRef
    const setRef = (el: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
      }
    }

    return (
      <div>
        <div style={containerStyle}>
          <input
            {...rest}
            ref={setRef}
            id={id}
            type={resolvedType}
            value={value}
            onChange={onChange}
            placeholder=" "
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            style={inputStyle}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
          />
          <label htmlFor={id} style={labelStyle}>
            {label}
          </label>
          {isPassword && (
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? '숨기기' : '보이기'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            style={{ ...footerStyle, color: 'var(--color-red)' }}
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${id}-hint`}
            style={{ ...footerStyle, color: 'var(--text-secondary)' }}
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)
