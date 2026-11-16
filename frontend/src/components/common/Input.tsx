import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  isCurrency?: boolean;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, isCurrency, showPasswordToggle = true, className = '', type, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const isNumber = type === 'number';
    const isPassword = type === 'password';
    const [isFocused, setIsFocused] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (isCurrency) {
        const rawDigits = e.target.value.replace(/\D/g, '');
        if (rawDigits === '' || rawDigits === '0') {
          e.target.select();
        }
      } else if (isNumber && (e.target.value === '0' || Number(e.target.value) === 0)) {
        e.target.select();
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setIsEmpty(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const rawDigits = e.target.value.replace(/\D/g, '');
        if (rawDigits === '') {
          setIsEmpty(true);
          e.target.value = '0';
        } else {
          setIsEmpty(false);
          const cleaned = rawDigits.replace(/^0+(?=\d)/, '');
          e.target.value = cleaned;
        }
        onChange?.(e);
        return;
      }

      if (isNumber) {
        if (e.target.value === '') {
          setIsEmpty(true);
        } else {
          setIsEmpty(false);
          // Strip leading zeros e.g. "08" -> "8", but preserve standalone "0"
          const cleaned = e.target.value.replace(/^0+(?=\d)/, '');
          if (cleaned !== e.target.value) {
            e.target.value = cleaned;
          }
        }
      }
      onChange?.(e);
    };

    // Calculate display value
    let displayValue: any = value;
    if (isCurrency) {
      if (isFocused && isEmpty) {
        displayValue = '';
      } else if (value !== undefined && value !== null && value !== '') {
        const num = Number(String(value).replace(/\D/g, ''));
        displayValue = isNaN(num) ? '' : new Intl.NumberFormat('vi-VN').format(num);
      } else {
        displayValue = '';
      }
    } else if (isNumber && isFocused && isEmpty) {
      displayValue = '';
    }

    const inputType = isCurrency ? 'text' : isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputMode = isCurrency ? 'numeric' : props.inputMode;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            inputMode={inputMode}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={props.placeholder || (isCurrency ? '0' : undefined)}
            className={`block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
              icon ? 'pl-10' : 'pl-3.5'
            } ${isCurrency ? 'pr-12 font-mono font-medium' : isPassword && showPasswordToggle !== false ? 'pr-10' : 'pr-3.5'} py-2 ${
              error
                ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-primary-500'
            } ${className}`}
            {...props}
          />
          {isCurrency && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-semibold text-xs select-none">
              VNĐ
            </div>
          )}
          {isPassword && showPasswordToggle !== false && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              tabIndex={-1}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

