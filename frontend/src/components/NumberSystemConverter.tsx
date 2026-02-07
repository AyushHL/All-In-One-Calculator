import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NumberSystemConverter: React.FC = () => {
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('2');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const { addHistory, user } = useApp();

  const numberSystems = [
    { value: '2', label: 'Binary (Base 2)', chars: '01' },
    { value: '8', label: 'Octal (Base 8)', chars: '01234567' },
    { value: '10', label: 'Decimal (Base 10)', chars: '0123456789' },
    { value: '16', label: 'Hexadecimal (Base 16)', chars: '0123456789ABCDEF' },
    { value: '32', label: 'Base 32', chars: '0123456789ABCDEFGHIJKLMNOPQRSTUV' },
    { value: '36', label: 'Base 36', chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  ];

  const validateInput = (value: string, base: string): boolean => {
    if (!value) return true;
    
    const validChars = numberSystems.find(ns => ns.value === base)?.chars || '';
    const upperValue = value.toUpperCase();
    
    for (let char of upperValue) {
      if (!validChars.includes(char)) {
        return false;
      }
    }
    return true;
  };

  const convertNumber = () => {
    if (!inputValue) {
      setResult('');
      return;
    }

    try {
      // Validate input
      if (!validateInput(inputValue, fromBase)) {
        setResult('Invalid input for selected base');
        return;
      }

      // Convert to decimal first
      const decimalValue = parseInt(inputValue, parseInt(fromBase));
      
      if (isNaN(decimalValue)) {
        setResult('Invalid number');
        return;
      }

      // Convert from decimal to target base
      const converted = decimalValue.toString(parseInt(toBase)).toUpperCase();
      setResult(converted);

      // Save to history if user is logged in
      if (user) {
        const fromLabel = numberSystems.find(ns => ns.value === fromBase)?.label || `Base ${fromBase}`;
        const toLabel = numberSystems.find(ns => ns.value === toBase)?.label || `Base ${toBase}`;
        addHistory(
          'Number System',
          `${inputValue} (${fromLabel}) → ${toLabel}`,
          converted
        );
      }
    } catch (error) {
      setResult('Conversion error');
    }
  };

  useEffect(() => {
    convertNumber();
  }, [inputValue, fromBase, toBase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
  };

  const swapBases = () => {
    const temp = fromBase;
    setFromBase(toBase);
    setToBase(temp);
    setInputValue(result);
  };

  const getPlaceholder = () => {
    switch (fromBase) {
      case '2':
        return 'e.g., 1010';
      case '8':
        return 'e.g., 17';
      case '10':
        return 'e.g., 42';
      case '16':
        return 'e.g., 2A';
      default:
        return 'Enter number';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30">
          <Hash className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Number System Converter</h2>
        </div>
      </motion.div>

      {/* From Base Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
        <select
          value={fromBase}
          onChange={(e) => setFromBase(e.target.value)}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all"
        >
          {numberSystems.map((system) => (
            <option key={system.value} value={system.value} className="bg-slate-800">
              {system.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-slate-300 mb-2">Input Value</label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white text-lg font-mono focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </motion.div>

      {/* Swap Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center mb-6"
      >
        <motion.button
          onClick={swapBases}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowRight className="w-6 h-6 rotate-90" />
        </motion.button>
      </motion.div>

      {/* To Base Selection */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
        <select
          value={toBase}
          onChange={(e) => setToBase(e.target.value)}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
        >
          {numberSystems.map((system) => (
            <option key={system.value} value={system.value} className="bg-slate-800">
              {system.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6 p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl border border-indigo-500/30"
      >
        <div className="text-sm text-slate-400 mb-2">Result</div>
        <div className="text-3xl md:text-4xl font-bold font-mono text-white break-all">
          {result || '0'}
        </div>
        {inputValue && result && result !== 'Invalid input for selected base' && result !== 'Conversion error' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm text-slate-400">Decimal Equivalent</div>
            <div className="text-xl font-semibold text-indigo-300">
              {parseInt(inputValue, parseInt(fromBase))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Examples */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-2"
      >
        {[
          { from: '10', to: '2', value: '42', label: 'Dec→Bin' },
          { from: '2', to: '10', value: '1010', label: 'Bin→Dec' },
          { from: '10', to: '16', value: '255', label: 'Dec→Hex' },
          { from: '16', to: '10', value: 'FF', label: 'Hex→Dec' },
        ].map((example, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setFromBase(example.from);
              setToBase(example.to);
              setInputValue(example.value);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"
          >
            {example.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Info */}
      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center"
        >
          <p className="text-sm text-indigo-300">
            💡 Sign in to save your conversion history
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default NumberSystemConverter;
