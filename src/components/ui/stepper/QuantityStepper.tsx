import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, ReactNode } from 'react';

interface QuantityStepperProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onValueChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export interface QuantityStepperRef {
  getValue: () => number;
  setValue: (value: number) => void;
}

const QuantityStepper = forwardRef<QuantityStepperRef, QuantityStepperProps>(
  ({ 
    initialValue = 1, 
    min = 1, 
    max = 99, 
    onValueChange, 
    className = '', 
    disabled = false 
  }, ref) => {
    const [quantity, setQuantity] = useState(initialValue);

    // Debug log for initial state
    console.log('[QuantityStepper] Initial quantity:', initialValue);

    const updateQuantity = useCallback((newQty: number) => {
      const clamped = Math.max(min, Math.min(max, newQty));
      setQuantity(prev => {
        const newValue = clamped;
        console.log(`[QuantityStepper] Updating ${prev} -> ${newValue} (clamped from ${newQty})`);
        onValueChange?.(newValue);
        return newValue;
      });
    }, [min, max, onValueChange]);

    useEffect(() => {
      console.log('[QuantityStepper] Effect updating to initialValue:', initialValue);
      setQuantity(initialValue);
    }, [initialValue]);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        console.log('[QuantityStepper] getValue called:', quantity);
        return quantity;
      },
      setValue: (value: number) => {
        console.log('[QuantityStepper] setValue called:', value);
        updateQuantity(value);
      },
    }), [quantity, updateQuantity]);

    const decrement = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[QuantityStepper] - button clicked, current:', quantity);
      updateQuantity(quantity - 1);
    };

    const increment = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[QuantityStepper] + button clicked, current:', quantity);
      updateQuantity(quantity + 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || min;
      console.log('[QuantityStepper] Input change:', e.target.value, '->', val);
      updateQuantity(val);
    };

    const handleInputBlur = () => {
      console.log('[QuantityStepper] Input blur, clamping to:', quantity);
      updateQuantity(quantity);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      }
    };

const buttonClassName = `p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer shadow transition-all font-bold w-12 h-12 flex items-center justify-center`; 

    const inputClassName = `
      w-20 h-10 px-3 text-center border-2 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 transition-all duration-200
      ${disabled 
        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600' 
        : 'border-gray-300 hover:border-gray-400 focus:border-brand-500 focus:ring-brand-500/50 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-brand-400'
      }
    `;

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={decrement}
          disabled={false}
          onMouseDown={(e) => e.preventDefault()}
          className={buttonClassName}
          aria-label="Decrease quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>

        <input
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
          className={inputClassName}
        />

        <button
          type="button"
          onClick={increment}
          disabled={false}
          onMouseDown={(e) => e.preventDefault()}
          className={buttonClassName}
          aria-label="Increase quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    );
  }
);

QuantityStepper.displayName = 'QuantityStepper';

export type { QuantityStepperProps };
export default QuantityStepper;

