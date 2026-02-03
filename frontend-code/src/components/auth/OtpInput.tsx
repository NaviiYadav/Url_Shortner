import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(inputValue)) return;

    // Take only the last character if multiple are pasted
    const char = inputValue.slice(-1);
    
    // Build new value
    const newValue = value.split('');
    newValue[index] = char;
    const joined = newValue.join('').slice(0, length);
    onChange(joined);

    // Move to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');
      
      if (value[index]) {
        // Delete current
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous and delete
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
    // Select the content
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200',
            'bg-background focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/50'
              : index === activeIndex
              ? 'border-primary focus:border-primary focus:ring-primary/50'
              : 'border-border hover:border-muted-foreground/50 focus:ring-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
