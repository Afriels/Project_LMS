import React, { useState, useEffect } from 'react';
import { BankSoal, Difficulty, QuestionType } from '../types';
import { generateQuestionsWithAI } from '../services/geminiService';
import { Plus, BrainCircuit, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const AIGenerateModal: React.FC<{ onClose: () => void; onAddQuestions: (questions: Partial<BankSoal>[]) => void; }> = ({ onClose, onAddQuestions }) => {
    const [topic, setTopic] = useState('Sejarah Indonesia');
    const [type, setType] = useState<QuestionType>(QuestionType.MCQ);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.SEDANG);
    const [count, setCount] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const newQuestions = await generateQuestionsWithAI(topic, type, difficulty, count);
            onAddQuestions(newQuestions);
            onClose();
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Generate Questions with AI</h2>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Topic</label>
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Type</label>
                        <select value={type} onChange={e => setType(e.target.value as QuestionType)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                            {Object.values(QuestionType).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                         <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                            {Object.values(Difficulty).map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Questions</label>
                        <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value))} min="1" max="10" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleGenerate} disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center">
                        {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const QuestionBankScreen: React.FC = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<BankSoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAIGenerate, setShowAIGenerate] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data, error } = await supabase.from('bank_soal').select('*');
            if (data) {
                setQuestions(data);
            }
            setLoading(false);
        };
        fetchQuestions();
    }, []);

    const handleAddQuestions = async (newQuestions: Partial<BankSoal>[]) => {
        if (!user) return;
        
        const questionsToInsert = newQuestions.map(q => ({...q, created_by: user.id}));

        const { data, error } = await supabase.from('bank_soal').insert(questionsToInsert).select();
        
        if (data) {
            setQuestions(prev => [...prev, ...data]);
        }
        if (error) {
            console.error("Error saving new questions:", error);
            alert("Could not save the generated questions.");
        }
    };

    if (loading) return <div>Loading questions...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
                <div className="space-x-2">
                     <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"><Plus className="w-4 h-4 mr-2"/>Add Manually</button>
                     <button onClick={() => setShowAIGenerate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"><BrainCircuit className="w-4 h-4 mr-2"/>Generate with AI</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="space-y-4">
                    {questions.map((q) => (
                        <div key={q.id} className="p-4 border rounded-md">
                            <p className="font-semibold">{q.pertanyaan}</p>
                            <div className="text-sm text-gray-600 mt-2">
                                <span className="font-bold">Type:</span> {q.tipe} | <span className="font-bold">Difficulty:</span> {q.tingkat_kesulitan}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAIGenerate && <AIGenerateModal onClose={() => setShowAIGenerate(false)} onAddQuestions={handleAddQuestions} />}
        </div>
    );
};


export default QuestionBankScreen;