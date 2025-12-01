import React, { useRef, useState, useCallback } from 'react';
import { Canvas, type CanvasRef } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { solveMathProblem, solveMathProblemFromText } from './services/geminiService';
import { PenIcon } from './components/icons/PenIcon';
import { TextIcon } from './components/icons/TextIcon';

interface MathSolution {
  expression: string;
  result: string;
  explanation: string;
}

type InputMode = 'handwriting' | 'text';

export default function App() {
  const canvasRef = useRef<CanvasRef>(null);
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('handwriting');
  const [textProblem, setTextProblem] = useState('');

  const handleSolve = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSolution(null);

    try {
      let result;
      if (inputMode === 'handwriting') {
        if (!canvasRef.current) return;
        const imageDataUrl = canvasRef.current.getImageData();
        if (!imageDataUrl) {
          setError("The canvas is empty. Please write a math problem.");
          setIsLoading(false);
          return;
        }
        result = await solveMathProblem(imageDataUrl);
      } else {
        if (!textProblem.trim()) {
          setError("The text input is empty. Please type a math problem.");
          setIsLoading(false);
          return;
        }
        result = await solveMathProblemFromText(textProblem);
      }
      setSolution(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to solve: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputMode, textProblem]);

  const handleClear = useCallback(() => {
    if (inputMode === 'handwriting') {
      canvasRef.current?.clearCanvas();
    } else {
      setTextProblem('');
    }
    setSolution(null);
    setError(null);
    setIsLoading(false);
  }, [inputMode]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextProblem(e.target.value);
    if (error) {
      setError(null);
    }
  };


  return (
    <div className="flex flex-col h-screen font-sans text-gray-800 dark:text-gray-200 antialiased overflow-hidden">
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            AI Math Notes
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="w-full max-w-6xl h-full max-h-[75vh] flex flex-row items-stretch justify-center space-x-0 sm:space-x-4">
          <div
            className="relative h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              width: solution ? '60%' : '100%',
              backgroundImage: `
                linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-gray-200 dark:bg-gray-700/50 p-1 rounded-full flex items-center space-x-1 shadow">
              <button
                onClick={() => setInputMode('handwriting')}
                aria-label="Handwrite input mode"
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2 ${
                    inputMode === 'handwriting'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
                }`}
              >
                  <PenIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Handwrite</span>
              </button>
              <button
                onClick={() => setInputMode('text')}
                aria-label="Text input mode"
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-2 ${
                    inputMode === 'text'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
                }`}
              >
                  <TextIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Type</span>
              </button>
            </div>

            {inputMode === 'handwriting' ? (
                <Canvas ref={canvasRef} />
            ) : (
                <div className="w-full h-full flex items-center justify-center p-4 pt-16">
                    <textarea
                        value={textProblem}
                        onChange={handleTextChange}
                        placeholder="Type a math problem..."
                        className="w-full max-w-full h-auto max-h-full p-4 text-3xl font-mono bg-transparent focus:outline-none resize-none text-gray-800 dark:text-gray-200 text-center"
                        aria-label="Math problem text input"
                        rows={3}
                    />
                </div>
            )}
            
            {error && (
              <div className="absolute bottom-20 sm:bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 p-3 rounded-lg shadow-md text-center animate-fade-in">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {solution && (
            <div
              className="h-full bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 overflow-y-auto transition-all duration-500 ease-in-out animate-fade-in"
              style={{ width: '40%' }}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Solution Breakdown</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expression</h3>
                <p className="text-xl font-mono p-3 bg-gray-200 dark:bg-gray-700 rounded-md mt-2 whitespace-nowrap overflow-x-auto">{solution.expression}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</h3>
                <p className="text-3xl font-bold font-mono p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md mt-2">{solution.result}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Step-by-step Explanation</h3>
                <div className="mt-2 text-gray-700 dark:text-gray-300 space-y-3 prose prose-sm dark:prose-invert">
                  {solution.explanation.split('\n').map((step, index) => (
                    step.trim() && <p key={index} className="leading-relaxed">{step}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 w-full p-4 bg-gray-100 dark:bg-gray-900">
        <Toolbar onSolve={handleSolve} onClear={handleClear} isLoading={isLoading} />
      </footer>
    </div>
  );
}