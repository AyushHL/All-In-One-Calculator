import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Trash2, Calculator, Pencil, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CustomSelect from './CustomSelect';

interface Semester {
  id: string;
  gpa: string;
  credits: string;
}

interface UniversityPreset {
  value: string;
  label: string;
  scale: number;
  formula: 'weighted' | 'simple';
  percentageFactor?: number;    // CGPA × factor = percentage
  percentageOffset?: number;    // (CGPA - offset) × factor = percentage
  description: string;
}

const universityPresets: UniversityPreset[] = [
  {
    value: 'dtu',
    label: 'DTU (Delhi Technological University)',
    scale: 10,
    formula: 'weighted',
    percentageFactor: 10,
    description: 'Σ(SGPA × Credits) ÷ Total Credits  |  Percentage = CGPA × 10'
  },
  {
    value: 'iit',
    label: 'IIT (Indian Institutes of Technology)',
    scale: 10,
    formula: 'weighted',
    percentageFactor: 10,
    description: 'Σ(SGPA × Credits) ÷ Total Credits  |  Percentage = CGPA × 10'
  },
  {
    value: 'vtu',
    label: 'VTU (Visvesvaraya Technological University)',
    scale: 10,
    formula: 'weighted',
    percentageFactor: 10,
    percentageOffset: 0.75,
    description: 'Σ(SGPA × Credits) ÷ Total Credits  |  Percentage = (CGPA − 0.75) × 10'
  },
  {
    value: 'mumbai',
    label: 'Mumbai University',
    scale: 10,
    formula: 'weighted',
    percentageFactor: 7.1,
    percentageOffset: 0,
    description: 'Σ(SGPA × Credits) ÷ Total Credits  |  Percentage = CGPA × 7.1 + 11'
  },
  {
    value: 'aktu',
    label: 'AKTU (APJ Abdul Kalam University)',
    scale: 10,
    formula: 'weighted',
    percentageFactor: 10,
    percentageOffset: 0.75,
    description: 'Σ(SGPA × Credits) ÷ Total Credits  |  Percentage = (CGPA − 0.75) × 10'
  },
  {
    value: 'anna',
    label: 'Anna University',
    scale: 10,
    formula: 'weighted',
    percentageFactor: 10,
    description: 'Σ(SGPA × Credits) ÷ Total Credits  |  Percentage = CGPA × 10'
  },
  {
    value: 'us4',
    label: 'US GPA (4.0 Scale)',
    scale: 4,
    formula: 'weighted',
    percentageFactor: 25,
    description: 'Σ(GPA × Credits) ÷ Total Credits  |  Percentage = GPA × 25'
  },
  {
    value: 'normal',
    label: 'Normal (Simple Average)',
    scale: 10,
    formula: 'simple',
    description: 'Σ(SGPA) ÷ Number of Semesters  |  No credit weighting'
  },
  {
    value: 'custom',
    label: 'Custom',
    scale: 10,
    formula: 'weighted',
    description: 'Define your own formula parameters'
  }
];

const CGPACalculator: React.FC = () => {
  const { addHistory, user } = useApp();
  const [calcMode, setCalcMode] = useState('dtu');
  const [customScale, setCustomScale] = useState('10');
  const [customFormula, setCustomFormula] = useState('weighted');
  const [customPercentFactor, setCustomPercentFactor] = useState('9.5');
  const [customPercentOffset, setCustomPercentOffset] = useState('0');
  const [customName, setCustomName] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', gpa: '', credits: '' }
  ]);
  const [result, setResult] = useState<{
    cgpa: string;
    percentage?: string;
    totalCredits?: string;
    totalGradePoints?: string;
  } | null>(null);

  const calcModeOptions = universityPresets.map(p => ({ value: p.value, label: p.label }));

  const customFormulaOptions = [
    { value: 'weighted', label: 'Credit Weighted' },
    { value: 'simple', label: 'Simple Average' }
  ];

  // Get current preset config
  const getActiveConfig = () => {
    const preset = universityPresets.find(p => p.value === calcMode);
    if (!preset) return universityPresets[0];

    if (calcMode === 'custom') {
      return {
        ...preset,
        scale: parseFloat(customScale) || 10,
        formula: customFormula as 'weighted' | 'simple',
        percentageFactor: parseFloat(customPercentFactor) || undefined,
        percentageOffset: parseFloat(customPercentOffset) || 0,
      };
    }
    return preset;
  };

  const config = getActiveConfig();
  const needsCredits = config.formula === 'weighted';

  const addSemester = () => {
    setSemesters([...semesters, { id: Date.now().toString(), gpa: '', credits: '' }]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const updateSemester = (id: string, field: keyof Semester, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    if (field === 'gpa' && parseFloat(value) > config.scale) return;

    setSemesters(semesters.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const computePercentage = (cgpa: number): string | undefined => {
    const cfg = getActiveConfig();
    if (!cfg.percentageFactor) return undefined;

    // Special case for Mumbai University: CGPA * 7.1 + 11
    if (calcMode === 'mumbai') {
      return (cgpa * 7.1 + 11).toFixed(2);
    }

    const offset = cfg.percentageOffset || 0;
    return ((cgpa - offset) * cfg.percentageFactor).toFixed(2);
  };

  const calculateCGPA = () => {
    const validSemesters = semesters.filter(s => 
      needsCredits ? (s.gpa !== '' && s.credits !== '') : s.gpa !== ''
    );

    if (validSemesters.length === 0) {
      setResult(null);
      return;
    }

    if (needsCredits) {
      let totalCredits = 0;
      let totalGradePoints = 0;

      validSemesters.forEach(sem => {
        const gpa = parseFloat(sem.gpa);
        const credits = parseFloat(sem.credits);
        if (!isNaN(gpa) && !isNaN(credits)) {
          totalCredits += credits;
          totalGradePoints += (gpa * credits);
        }
      });

      if (totalCredits > 0) {
        const cgpaVal = totalGradePoints / totalCredits;
        const cgpa = cgpaVal.toFixed(3);
        const percentage = computePercentage(cgpaVal);
        setResult({
          cgpa,
          percentage,
          totalCredits: totalCredits.toString(),
          totalGradePoints: totalGradePoints.toFixed(2)
        });

        if (user) {
          const preset = universityPresets.find(p => p.value === calcMode);
          const label = calcMode === 'custom' ? (customName || 'Custom') : (preset?.label.split('(')[0].trim() || calcMode);
          addHistory('CGPA Calculator', `${label} - ${validSemesters.length} Semesters`, cgpa);
        }
      } else {
        setResult(null);
      }
    } else {
      let totalGPA = 0;
      let count = 0;

      validSemesters.forEach(sem => {
        const gpa = parseFloat(sem.gpa);
        if (!isNaN(gpa)) {
          totalGPA += gpa;
          count++;
        }
      });

      if (count > 0) {
        const cgpaVal = totalGPA / count;
        const cgpa = cgpaVal.toFixed(3);
        const percentage = computePercentage(cgpaVal);
        setResult({ cgpa, percentage });

        if (user) {
          const preset = universityPresets.find(p => p.value === calcMode);
          const label = calcMode === 'custom' ? (customName || 'Custom') : (preset?.label.split('(')[0].trim() || calcMode);
          addHistory('CGPA Calculator', `${label} - ${validSemesters.length} Semesters`, cgpa);
        }
      } else {
        setResult(null);
      }
    }
  };

  useEffect(() => {
    calculateCGPA();
  }, [semesters, calcMode, customFormula, customScale, customPercentFactor, customPercentOffset]);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/30">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">CGPA Calculator</h2>
        </div>
      </motion.div>

      {/* University / Formula Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-slate-300 mb-3">University / Formula</label>
        <CustomSelect
          value={calcMode}
          onChange={setCalcMode}
          options={calcModeOptions}
          theme="cyan"
          className="input-field w-full text-lg"
        />
        <div className="mt-2 flex items-start gap-1.5 ml-1">
          <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400">{config.description}</p>
        </div>
      </motion.div>

      {/* Custom Mode Settings */}
      <AnimatePresence>
        {calcMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-1">
              <Pencil className="w-4 h-4" />
              Custom Formula Settings
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">University / Label Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. IIT Delhi, MIT, Your University"
                className="input-field w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Formula Type</label>
                <CustomSelect
                  value={customFormula}
                  onChange={setCustomFormula}
                  options={customFormulaOptions}
                  theme="cyan"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">GPA Scale (Max)</label>
                <input
                  type="text"
                  value={customScale}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setCustomScale(e.target.value);
                  }}
                  placeholder="e.g. 10"
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Percentage Multiplier</label>
                <input
                  type="text"
                  value={customPercentFactor}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setCustomPercentFactor(e.target.value);
                  }}
                  placeholder="e.g. 9.5"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Offset (subtracted before ×)</label>
                <input
                  type="text"
                  value={customPercentOffset}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setCustomPercentOffset(e.target.value);
                  }}
                  placeholder="e.g. 0.75"
                  className="input-field w-full"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Percentage = (CGPA − {customPercentOffset || '0'}) × {customPercentFactor || '0'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl border border-emerald-500/30 shadow-xl backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="text-sm text-emerald-300/80 uppercase tracking-wider font-semibold mb-1">Aggregate CGPA</div>
                <div className="text-5xl md:text-6xl font-bold font-mono text-white tracking-tight">
                  {result.cgpa}
                </div>
                <div className="text-xs text-slate-400 mt-1">out of {config.scale}.0</div>
              </div>

              <div className="flex gap-6 md:border-l md:border-emerald-500/20 md:pl-6 flex-wrap justify-center">
                {result.percentage && (
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Percentage</div>
                    <div className="text-2xl font-semibold text-emerald-100">{result.percentage}%</div>
                  </div>
                )}
                {needsCredits && result.totalCredits && (
                  <>
                    <div className="text-center">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Credits</div>
                      <div className="text-2xl font-semibold text-emerald-100">{result.totalCredits}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Grade Points</div>
                      <div className="text-2xl font-semibold text-emerald-100">{result.totalGradePoints}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semesters Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Semester Details
          </h3>
          <div className="text-sm text-slate-400 font-medium">
            {semesters.length} {semesters.length === 1 ? 'Semester' : 'Semesters'}
          </div>
        </div>

        <AnimatePresence>
          {semesters.map((sem, index) => (
            <motion.div
              key={sem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 md:gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/[0.07] hover:border-white/20 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                {index + 1}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="relative">
                  <label className="md:hidden text-xs text-slate-400 mb-1 block">GPA (0-{config.scale})</label>
                  <input
                    type="text"
                    value={sem.gpa}
                    onChange={(e) => updateSemester(sem.id, 'gpa', e.target.value)}
                    placeholder={`GPA (e.g. ${config.scale === 4 ? '3.5' : '8.6'})`}
                    className="input-field w-full text-lg"
                  />
                </div>
                
                {needsCredits && (
                  <div className="relative">
                    <label className="md:hidden text-xs text-slate-400 mb-1 block">Credits</label>
                    <input
                      type="text"
                      value={sem.credits}
                      onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                      placeholder="Credits (e.g. 22)"
                      className="input-field w-full text-lg"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => removeSemester(sem.id)}
                disabled={semesters.length === 1}
                className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 shrink-0"
                title="Remove semester"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          onClick={addSemester}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl transition-all font-semibold mt-4"
        >
          <Plus className="w-5 h-5" />
          Add Semester
        </motion.button>
      </div>

      {/* Info */}
      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
        >
          <p className="text-sm text-emerald-300">
            💡 Sign in to save your CGPA calculation history
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CGPACalculator;
