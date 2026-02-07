import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cake, Calendar as CalendarIcon, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AgeCalculator: React.FC = () => {
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalMonths: number;
    nextBirthday: number;
  } | null>(null);
  const { addHistory, user } = useApp();

  const calculateAge = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate total months
    const totalMonths = years * 12 + months;

    // Next birthday
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const result = {
      years,
      months,
      days,
      totalDays,
      totalMonths,
      nextBirthday: daysUntilBirthday,
    };

    setAge(result);

    // Save to history
    if (user) {
      addHistory('Age', birthDate, `${years} years, ${months} months, ${days} days`);
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Age Calculator
          </h2>
          <p className="text-slate-400">Calculate your exact age</p>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="input-field w-full text-lg"
          />
        </div>

        {/* Calculate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={calculateAge}
          className="w-full btn-primary py-4 text-lg"
          disabled={!birthDate}
        >
          Calculate Age
        </motion.button>

        {/* Result */}
        {age && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Main Age Display */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-center">
              <Cake className="mx-auto mb-4" size={48} />
              <div className="text-5xl font-bold mb-2">{age.years}</div>
              <div className="text-2xl font-semibold mb-4">Years Old</div>
              <div className="text-lg opacity-90">
                {age.months} months and {age.days} days
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 glass-morphism rounded-xl text-center">
                <CalendarIcon className="mx-auto mb-2 text-blue-400" size={24} />
                <div className="text-2xl font-bold">{age.totalMonths}</div>
                <div className="text-sm text-slate-400">Total Months</div>
              </div>
              <div className="p-4 glass-morphism rounded-xl text-center">
                <CalendarIcon className="mx-auto mb-2 text-green-400" size={24} />
                <div className="text-2xl font-bold">{age.totalDays.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Total Days</div>
              </div>
              <div className="p-4 glass-morphism rounded-xl text-center col-span-2 md:col-span-1">
                <Gift className="mx-auto mb-2 text-pink-400" size={24} />
                <div className="text-2xl font-bold">{age.nextBirthday}</div>
                <div className="text-sm text-slate-400">Days to Birthday</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className="text-slate-400">Hours</div>
                  <div className="text-xl font-semibold text-purple-400">
                    {(age.totalDays * 24).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Minutes</div>
                  <div className="text-xl font-semibold text-purple-400">
                    {(age.totalDays * 24 * 60).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
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
              💡 Sign in to save your age calculations
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AgeCalculator;
