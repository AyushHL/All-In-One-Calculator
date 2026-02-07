import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Converter: React.FC = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('miles');
  const [result, setResult] = useState<number | null>(null);
  const [category, setCategory] = useState('length');
  const { addHistory, user } = useApp();

  const conversions: any = {
    length: {
      units: ['meters', 'km', 'miles', 'feet', 'inches', 'cm'],
      rates: {
        meters: 1,
        km: 0.001,
        miles: 0.000621371,
        feet: 3.28084,
        inches: 39.3701,
        cm: 100,
      },
    },
    weight: {
      units: ['kg', 'grams', 'pounds', 'ounces'],
      rates: {
        kg: 1,
        grams: 1000,
        pounds: 2.20462,
        ounces: 35.274,
      },
    },
    temperature: {
      units: ['celsius', 'fahrenheit', 'kelvin'],
      convert: (val: number, from: string, to: string) => {
        let celsius = val;
        if (from === 'fahrenheit') celsius = (val - 32) * 5/9;
        if (from === 'kelvin') celsius = val - 273.15;

        if (to === 'fahrenheit') return celsius * 9/5 + 32;
        if (to === 'kelvin') return celsius + 273.15;
        return celsius;
      },
    },
  };

  const convert = () => {
    const val = parseFloat(value);
    if (isNaN(val)) return;

    let convertedValue: number;

    if (category === 'temperature') {
      convertedValue = conversions.temperature.convert(val, fromUnit, toUnit);
    } else {
      const fromRate = conversions[category].rates[fromUnit];
      const toRate = conversions[category].rates[toUnit];
      convertedValue = (val / fromRate) * toRate;
    }

    setResult(Math.round(convertedValue * 100000) / 100000);

    // Save to history
    if (user) {
      addHistory('Converter', `${val} ${fromUnit} to ${toUnit}`, convertedValue.toString());
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result !== null) {
      setValue(result.toString());
      setResult(parseFloat(value));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            Unit Converter
          </h2>
          <p className="text-slate-400">Convert between different units</p>
        </div>

        {/* Category Selection */}
        <div className="flex gap-2 justify-center">
          {['length', 'weight', 'temperature'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setFromUnit(conversions[cat].units[0]);
                setToUnit(conversions[cat].units[1]);
                setValue('');
                setResult(null);
              }}
              className={`px-6 py-2 rounded-xl font-semibold capitalize transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Conversion Form */}
        <div className="space-y-4">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input-field text-lg"
                placeholder="Enter value"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="input-field text-lg capitalize"
              >
                {conversions[category].units.map((unit: string) => (
                  <option key={unit} value={unit} className="bg-slate-800">
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={swapUnits}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            >
              <ArrowRightLeft size={24} />
            </motion.button>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={result !== null ? result : ''}
                readOnly
                className="input-field text-lg bg-white/10"
                placeholder="Result"
              />
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="input-field text-lg capitalize"
              >
                {conversions[category].units.map((unit: string) => (
                  <option key={unit} value={unit} className="bg-slate-800">
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Convert Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={convert}
          className="w-full btn-primary py-4 text-lg"
          disabled={!value}
        >
          Convert
        </motion.button>

        {/* Result Display */}
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-center"
          >
            <div className="text-lg mb-2">{value} {fromUnit} =</div>
            <div className="text-4xl font-bold">{result} {toUnit}</div>
          </motion.div>
        )}

        {/* Info */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center"
          >
            <p className="text-sm text-blue-300">
              💡 Sign in to save your conversions
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Converter;
