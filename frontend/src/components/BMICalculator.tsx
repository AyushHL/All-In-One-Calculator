import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const { addHistory, user } = useApp();

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to m

    if (w > 0 && h > 0) {
      const bmiValue = w / (h * h);
      const roundedBMI = Math.round(bmiValue * 10) / 10;
      setBmi(roundedBMI);

      let cat = '';
      if (roundedBMI < 18.5) cat = 'Underweight';
      else if (roundedBMI < 25) cat = 'Normal weight';
      else if (roundedBMI < 30) cat = 'Overweight';
      else cat = 'Obese';

      setCategory(cat);

      // Save to history
      if (user) {
        addHistory('BMI', `${w}kg / ${height}cm`, `${roundedBMI} (${cat})`);
      }
    }
  };

  const getBMIColor = () => {
    if (!bmi) return 'from-gray-500 to-gray-600';
    if (bmi < 18.5) return 'from-blue-500 to-cyan-500';
    if (bmi < 25) return 'from-green-500 to-emerald-500';
    if (bmi < 30) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getBMIIcon = () => {
    if (!bmi) return <Scale size={40} />;
    if (bmi < 18.5) return <TrendingDown size={40} />;
    if (bmi < 25) return <Minus size={40} />;
    return <TrendingUp size={40} />;
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
          <h2 className="text-3xl font-bold text-gradient-cyan mb-2">BMI Calculator</h2>
          <p className="text-slate-400">Calculate your Body Mass Index</p>
        </div>

        {/* Input Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input-field w-full text-lg"
              placeholder="70"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input-field w-full text-lg"
              placeholder="175"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={calculateBMI}
          className="w-full btn-primary py-4 text-lg"
          disabled={!weight || !height}
        >
          Calculate BMI
        </motion.button>

        {/* Result */}
        {bmi !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-8 rounded-3xl bg-gradient-to-br ${getBMIColor()} text-white text-center`}
          >
            <div className="flex justify-center mb-4">
              {getBMIIcon()}
            </div>
            <div className="text-6xl font-bold mb-2">{bmi}</div>
            <div className="text-2xl font-semibold mb-4">{category}</div>
            <div className="text-sm opacity-90">
              Body Mass Index
            </div>
          </motion.div>
        )}

        {/* BMI Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
            <div className="text-xs text-blue-300 mb-1">Underweight</div>
            <div className="text-sm font-semibold text-blue-400">&lt; 18.5</div>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <div className="text-xs text-green-300 mb-1">Normal</div>
            <div className="text-sm font-semibold text-green-400">18.5 - 24.9</div>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
            <div className="text-xs text-yellow-300 mb-1">Overweight</div>
            <div className="text-sm font-semibold text-yellow-400">25 - 29.9</div>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <div className="text-xs text-red-300 mb-1">Obese</div>
            <div className="text-sm font-semibold text-red-400">≥ 30</div>
          </div>
        </div>

        {/* Info */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center"
          >
            <p className="text-sm text-blue-300">
              💡 Sign in to save your BMI calculations
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BMICalculator;
