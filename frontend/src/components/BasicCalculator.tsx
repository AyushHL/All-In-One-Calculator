import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Basic Calculator - Simple arithmetic operations
const BasicCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);
  const { addHistory, user } = useApp();

  const buttons = [
    { value: 'C', label: 'C', type: 'clear' },
    { value: 'del', label: '⌫', type: 'delete' },
    { value: '%', label: '%', type: 'operator' },
    { value: '/', label: '÷', type: 'operator' },
    
    { value: '7', label: '7', type: 'number' },
    { value: '8', label: '8', type: 'number' },
    { value: '9', label: '9', type: 'number' },
    { value: '*', label: '×', type: 'operator' },
    
    { value: '4', label: '4', type: 'number' },
    { value: '5', label: '5', type: 'number' },
    { value: '6', label: '6', type: 'number' },
    { value: '-', label: '-', type: 'operator' },
    
    { value: '1', label: '1', type: 'number' },
    { value: '2', label: '2', type: 'number' },
    { value: '3', label: '3', type: 'number' },
    { value: '+', label: '+', type: 'operator' },
    
    { value: '0', label: '0', type: 'number', colSpan: 2 },
    { value: '.', label: '.', type: 'number' },
    { value: '=', label: '=', type: 'equals' },
  ];

  const handleButtonClick = (button: typeof buttons[0]) => {
    if (button.value === 'C') {
      setDisplay('0');
      setPreviousValue(null);
      setOperation(null);
      setResetDisplay(false);
    } else if (button.value === 'del') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    } else if (button.type === 'operator') {
      if (previousValue !== null && operation !== null && !resetDisplay) {
        calculate();
      }
      setPreviousValue(display);
      setOperation(button.value);
      setResetDisplay(true);
    } else if (button.value === '=') {
      calculate();
    } else {
      // Number or decimal
      if (resetDisplay) {
        setDisplay(button.value);
        setResetDisplay(false);
      } else {
        if (button.value === '.' && display.includes('.')) return;
        setDisplay(display === '0' ? button.value : display + button.value);
      }
    }
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        result = prev / current;
        break;
      case '%':
        result = prev % current;
        break;
      default:
        return;
    }

    const resultString = result.toString();
    setDisplay(resultString);
    
    // Save to history
    if (user) {
      const expression = `${previousValue} ${operation} ${display}`;
      addHistory('Basic', expression, resultString);
    }
    
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(true);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const key = e.key;
      
      // Numbers 0-9
      if (/^[0-9]$/.test(key)) {
        const button = buttons.find(b => b.value === key);
        if (button) handleButtonClick(button);
      }
      // Decimal point
      else if (key === '.') {
        const button = buttons.find(b => b.value === '.');
        if (button) handleButtonClick(button);
      }
      // Operators
      else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const button = buttons.find(b => b.value === key);
        if (button) handleButtonClick(button);
      }
      // Percentage
      else if (key === '%') {
        const button = buttons.find(b => b.value === '%');
        if (button) handleButtonClick(button);
      }
      // Equals
      else if (key === 'Enter' || key === '=') {
        const button = buttons.find(b => b.value === '=');
        if (button) handleButtonClick(button);
      }
      // Clear
      else if (key === 'Escape' || key.toLowerCase() === 'c') {
        const button = buttons.find(b => b.value === 'C');
        if (button) handleButtonClick(button);
      }
      // Delete/Backspace
      else if (key === 'Backspace' || key === 'Delete') {
        const button = buttons.find(b => b.value === 'del');
        if (button) handleButtonClick(button);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operation, resetDisplay]);

  const getButtonStyle = (type: string) => {
    switch (type) {
      case 'clear':
        return 'calc-button-clear';
      case 'equals':
        return 'calc-button-equals col-span-1';
      case 'operator':
        return 'calc-button-operator';
      case 'delete':
        return 'bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold text-lg p-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl active:scale-95';
      default:
        return 'calc-button';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 bg-black/40 rounded-3xl border border-white/10"
      >
        <div className="text-right">
          {previousValue && operation && (
            <div className="text-sm text-slate-400 mb-2 h-6">
              {previousValue} {operation}
            </div>
          )}
          <div className="text-5xl md:text-6xl font-bold font-mono text-white overflow-x-auto scrollbar-hide">
            {display}
          </div>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3"
      >
        {buttons.map((button, index) => (
          <motion.button
            key={index}
            onClick={() => handleButtonClick(button)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${getButtonStyle(button.type)} ${button.colSpan === 2 ? 'col-span-2' : ''}`}
          >
            {button.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Info */}
      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center"
        >
          <p className="text-sm text-blue-300">
            💡 Sign in to save your calculation history
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BasicCalculator;
