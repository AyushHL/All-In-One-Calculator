import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { evaluate } from 'mathjs';
import { useApp } from '../context/AppContext';

const Scientific: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const { addHistory, user } = useApp();

  const buttons = [
    { value: 'C', label: 'C', type: 'clear' },
    { value: 'del', label: '⌫', type: 'delete' },
    { value: '(', label: '(', type: 'operator' },
    { value: ')', label: ')', type: 'operator' },
    { value: '%', label: '%', type: 'operator' },
    { value: '/', label: '÷', type: 'operator' },
    
    { value: 'sin(', label: 'sin', type: 'function' },
    { value: 'cos(', label: 'cos', type: 'function' },
    { value: 'tan(', label: 'tan', type: 'function' },
    { value: '7', label: '7', type: 'number' },
    { value: '8', label: '8', type: 'number' },
    { value: '9', label: '9', type: 'number' },
    
    { value: 'asin(', label: 'sin⁻¹', type: 'function' },
    { value: 'acos(', label: 'cos⁻¹', type: 'function' },
    { value: 'atan(', label: 'tan⁻¹', type: 'function' },
    { value: '4', label: '4', type: 'number' },
    { value: '5', label: '5', type: 'number' },
    { value: '6', label: '6', type: 'number' },
    
    { value: 'log(', label: 'log', type: 'function' },
    { value: 'log10(', label: 'log₁₀', type: 'function' },
    { value: 'exp(', label: 'eˣ', type: 'function' },
    { value: '1', label: '1', type: 'number' },
    { value: '2', label: '2', type: 'number' },
    { value: '3', label: '3', type: 'number' },
    
    { value: 'sqrt(', label: '√', type: 'function' },
    { value: '^2', label: 'x²', type: 'function' },
    { value: '^', label: 'xʸ', type: 'operator' },
    { value: '0', label: '0', type: 'number' },
    { value: '.', label: '.', type: 'number' },
    { value: 'pi', label: 'π', type: 'constant' },
    
    { value: '!', label: 'x!', type: 'function' },
    { value: 'e', label: 'e', type: 'constant' },
    { value: 'abs(', label: '|x|', type: 'function' },
    { value: '*', label: '×', type: 'operator' },
    { value: '-', label: '-', type: 'operator' },
    { value: '+', label: '+', type: 'operator' },
  ];

  const handleButtonClick = (button: typeof buttons[0]) => {
    if (button.value === 'C') {
      setDisplay('0');
      setExpression('');
    } else if (button.value === 'del') {
      if (expression.length > 0) {
        const newExpr = expression.slice(0, -1);
        setExpression(newExpr);
        setDisplay(newExpr || '0');
      }
    } else if (button.value === '=') {
      try {
        let evalExpression = expression
          .replace(/\^2/g, '^2')
          .replace(/pi/g, 'pi')
          .replace(/!/g, '!');
        
        const result = evaluate(evalExpression);
        setDisplay(result.toString());
        
        // Save to history if user is logged in
        if (user) {
          addHistory('Scientific', expression, result.toString());
        }
        
        setExpression(result.toString());
      } catch (error) {
        setDisplay('Error');
        setExpression('');
      }
    } else if (button.type === 'constant') {
      const newExpression = expression === '0' ? button.value : expression + button.value;
      setExpression(newExpression);
      setDisplay(newExpression);
    } else {
      const newExpression = expression === '0' ? button.value : expression + button.value;
      setExpression(newExpression);
      setDisplay(newExpression);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

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
      // Basic operators
      else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const button = buttons.find(b => b.value === key);
        if (button) handleButtonClick(button);
      }
      // Parentheses
      else if (key === '(') {
        const button = buttons.find(b => b.value === '(');
        if (button) handleButtonClick(button);
      }
      else if (key === ')') {
        const button = buttons.find(b => b.value === ')');
        if (button) handleButtonClick(button);
      }
      // Percentage
      else if (key === '%') {
        const button = buttons.find(b => b.value === '%');
        if (button) handleButtonClick(button);
      }
      // Power
      else if (key === '^') {
        const button = buttons.find(b => b.value === '^');
        if (button) handleButtonClick(button);
      }
      // Factorial
      else if (key === '!') {
        const button = buttons.find(b => b.value === '!');
        if (button) handleButtonClick(button);
      }
      // Constants
      else if (key.toLowerCase() === 'p') {
        const button = buttons.find(b => b.value === 'pi');
        if (button) handleButtonClick(button);
      }
      else if (key.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey) {
        const button = buttons.find(b => b.value === 'e');
        if (button) handleButtonClick(button);
      }
      // Functions (shortcuts)
      else if (key.toLowerCase() === 's') {
        const button = buttons.find(b => b.value === 'sin(');
        if (button) handleButtonClick(button);
      }
      else if (key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
        // Allow Ctrl+C for copy
        return;
      }
      else if (key.toLowerCase() === 'c') {
        const button = buttons.find(b => b.value === 'cos(');
        if (button) handleButtonClick(button);
      }
      else if (key.toLowerCase() === 't') {
        const button = buttons.find(b => b.value === 'tan(');
        if (button) handleButtonClick(button);
      }
      else if (key.toLowerCase() === 'l') {
        const button = buttons.find(b => b.value === 'log(');
        if (button) handleButtonClick(button);
      }
      else if (key.toLowerCase() === 'r') {
        const button = buttons.find(b => b.value === 'sqrt(');
        if (button) handleButtonClick(button);
      }
      // Equals
      else if (key === 'Enter' || key === '=') {
        handleButtonClick({ value: '=', label: '=', type: 'equals' });
      }
      // Clear
      else if (key === 'Escape') {
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
  }, [expression, display]);

  const getButtonStyle = (type: string) => {
    switch (type) {
      case 'clear':
        return 'calc-button-clear';
      case 'equals':
        return 'calc-button-equals col-span-1';
      case 'operator':
        return 'calc-button-operator';
      case 'function':
        return 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-lg p-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl active:scale-95';
      case 'delete':
        return 'bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold text-lg p-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl active:scale-95';
      default:
        return 'calc-button';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 bg-black/40 rounded-3xl border border-white/10"
      >
        <div className="text-right">
          <div className="text-sm text-slate-400 mb-2 h-6 overflow-hidden">
            {expression || ' '}
          </div>
          <div className="text-4xl md:text-5xl font-bold font-mono text-white overflow-x-auto scrollbar-hide">
            {display}
          </div>
        </div>
      </motion.div>

      {/* Buttons Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-6 gap-2"
      >
        {buttons.map((button, index) => (
          <motion.button
            key={index}
            onClick={() => handleButtonClick(button)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${getButtonStyle(button.type)} text-sm md:text-base p-3`}
          >
            {button.label}
          </motion.button>
        ))}
        <motion.button
          onClick={() => handleButtonClick({ value: '=', label: '=', type: 'equals' })}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="calc-button-equals col-span-6 text-lg md:text-xl p-4"
        >
          =
        </motion.button>
      </motion.div>

      {/* Keyboard Shortcuts Help Button */}
      <motion.button
        onClick={() => setShowHelp(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 w-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
      >
        <HelpCircle className="w-5 h-5" />
        Keyboard Shortcuts
      </motion.button>

      {/* Help Modal */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-400" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Numbers & Basic</h3>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Numbers:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">0-9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decimal:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operators:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">+ - * /</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parentheses:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">( )</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentage:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-purple-400 font-semibold mb-2">Special Operations</h3>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Power:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">^</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Factorial:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">!</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pi (π):</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">P</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Euler's number (e):</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">E</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-green-400 font-semibold mb-2">Functions</h3>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Sine:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">S → sin(</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cosine:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">C → cos(</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tangent:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">T → tan(</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logarithm:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">L → log(</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Square Root:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">R → sqrt(</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-orange-400 font-semibold mb-2">Controls</h3>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Calculate:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">Enter / =</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clear:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">Escape</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete:</span>
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded">Backspace</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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

export default Scientific;
