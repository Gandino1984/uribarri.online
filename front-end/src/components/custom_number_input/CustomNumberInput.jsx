import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from './CustomNumberInput.module.css';

const CustomNumberInput = ({ 
  value, 
  onChange, 
  name,
  min,
  max,
  step = 1,
  required = false,
  label
}) => {
  const parseValue = (val) => {
    // Handle empty or non-numeric values
    if (val === '' || val === null || val === undefined) {
      return '';
    }
    return typeof val === 'number' ? val : parseFloat(val);
  };

  const formatValue = (val) => {
    if (val === '' || val === null || val === undefined) {
      return '';
    }
    
    // Determine decimal places based on step
    const stepDecimals = step.toString().split('.')[1]?.length || 0;
    return Number(val).toFixed(stepDecimals);
  };

  const handleIncrement = () => {
    const currentValue = parseValue(value);
    
    // If empty, start from min or 0
    if (currentValue === '') {
      const startValue = typeof min !== 'undefined' ? min : 0;
      onChange({ target: { name, value: formatValue(startValue) } });
      return;
    }

    const newValue = currentValue + Number(step);
    if (typeof max === 'undefined' || newValue <= max) {
      onChange({ target: { name, value: formatValue(newValue) } });
    }
  };

  const handleDecrement = () => {
    const currentValue = parseValue(value);
    
    // If empty, start from min or 0
    if (currentValue === '') {
      const startValue = typeof min !== 'undefined' ? min : 0;
      onChange({ target: { name, value: formatValue(startValue) } });
      return;
    }

    const newValue = currentValue - Number(step);
    if (typeof min === 'undefined' || newValue >= min) {
      onChange({ target: { name, value: formatValue(newValue) } });
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      onChange({ target: { name, value: '' } });
      return;
    }

    const numValue = parseFloat(inputValue);
    
    // Validate number
    if (!isNaN(numValue)) {
      // Check if within min/max bounds
      if ((typeof min === 'undefined' || numValue >= min) && 
          (typeof max === 'undefined' || numValue <= max)) {
        // For price_product, ensure max 2 decimal places
        if (name === 'price_product') {
          const decimals = inputValue.split('.')[1]?.length || 0;
          if (decimals <= 2) {
            onChange({ target: { name, value: numValue } });
          }
        } else {
          onChange({ target: { name, value: numValue } });
        }
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className="relative">
        <div className={styles.inputContainer}>
          <button
            type="button"
            onClick={handleDecrement}
            className="flex items-center justify-center h-1/2 w-6 p-0 m-0 border-none bg-transparent hover:bg-gray-100"
          >
            <ChevronDown size={12} />
          </button>
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            name={name}
            min={min}
            max={max}
            step={step}
            required={required}
            className="pr-6"
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="flex items-center justify-center h-1/2 w-6 p-0 m-0 border-none bg-transparent hover:bg-gray-100"
          >
            <ChevronUp size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomNumberInput;