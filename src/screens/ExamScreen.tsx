
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Ujian, BankSoal, QuestionType } from '../types';
import { supabase } from '../services/supabaseClient';

const ExamTaker: React.FC<{ exam: Ujian, attemptId: number, onFinish: () => void }> = ({ exam, attemptId, onFinish }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(exam.durasi_menit * 60);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const autosaveAnswer = useCallback(
        async (soalId: number, answer: string) => {
            await supabase.from('jawaban').upsert({
                attempt_id: attemptId,
                soal_id: soalId,
                jawaban_user: answer
            }, { onConflict: 'attempt_id, soal_id' });
        },
        [attemptId]
    );

    const handleAnswerChange = (soalId: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [soalId]: answer }));
        autosaveAnswer(soalId, answer);
    }

    const handleSubmit = async () => {
        // Call the grading function
        const { error } = await supabase.rpc('grade_objective_attempt', { p_attempt_id: attemptId });
        if (error) {
            console.error("Error grading attempt:", error);
            alert("There was an issue submitting your exam. Please contact your teacher.");
        }
        onFinish();
    };

    const currentQuestion = exam.bank_soal[currentQuestionIndex];

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold">{exam.judul}</h2>
                <div className="text-xl font-mono bg-red-100 text-red-700 px-4 py-2 rounded-md">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </div>

            {currentQuestion && (
                <div>
                    <p className="text-lg mb-4">Question {currentQuestionIndex + 1} of {exam.bank_soal.length}</p>
                    <p className="font-semibold text-xl mb-6">{currentQuestion.pertanyaan}</p>
                    {currentQuestion.tipe === QuestionType.MCQ && currentQuestion.opsi_json && (
                        <div className="space-y-3">
                            {currentQuestion.opsi_json.map(opt => (
                                <label key={opt.value} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name={`q_${currentQuestion.id}`} value={opt.value} className="mr-3"
                                        checked={answers[currentQuestion.id] === opt.value}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)} />
                                    {opt.text}
                                </label>
                            ))}
                        </div>
                    )}
                    {currentQuestion.tipe === QuestionType.ESAI && (
                        <textarea
                            rows={8}
                            className="w-full p-3 border rounded-md"
                            placeholder="Type your answer here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        />
                    )}
                </div>
            )}

            <div className="flex justify-between mt-8">
                <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(i => i - 1)}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >Previous</button>

                {currentQuestionIndex === exam.bank_soal.length - 1 ? (
                    <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Submit Exam</button>
                ) : (
                    <button onClick={() => setCurrentQuestionIndex(i => i + 1)} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Next</button>
                )}
            </div>
        </div>
    );
};


const StudentExamView: React.FC = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState<Ujian[]>([]);
    const [loading, setLoading] = useState(true);
    const [takingExam, setTakingExam] = useState<{ exam: Ujian, attemptId: number } | null>(null);

    useEffect(() => {
        const fetchExams = async () => {
            if (!user?.kelas_id) return;

            const { data, error } = await supabase
                .from('ujian')
                .select(`*, ujian_soal(bank_soal(*))`)
                .eq('kelas_id', user.kelas_id);

            if (data) {
                const formattedExams = data.map(exam => ({
                    ...exam,
                    bank_soal: exam.ujian_soal.map((us: any) => us.bank_soal)
                }));
                setExams(formattedExams as Ujian[]);
            }
            setLoading(false);
        };
        fetchExams();
    }, [user]);

    const handleStartExam = async (exam: Ujian) => {
        if (!user) return;
        
        // Create a new attempt
        const { data, error } = await supabase
            .from('attempt')
            .insert({
                ujian_id: exam.id,
                user_id: user.id,
                status: 'in_progress',
            })
            .select()
            .single();

        if (error || !data) {
            console.error("Failed to start exam attempt", error);
            alert("Could not start the exam. Please try again.");
            return;
        }

        setTakingExam({ exam, attemptId: data.id });
    };

    if (loading) return <div>Loading exams...</div>;
    
    if (takingExam) {
        return <ExamTaker exam={takingExam.exam} attemptId={takingExam.attemptId} onFinish={() => setTakingExam(null)} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Exams</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {exams.length > 0 ? exams.map(exam => (
                    <div key={exam.id} className="flex justify-between items-center p-4 border-b">
                        <div>
                            <h3 className="font-semibold text-lg">{exam.judul}</h3>
                            <p className="text-sm text-gray-600">{exam.deskripsi}</p>
                            <p className="text-sm text-gray-500">Duration: {exam.durasi_menit} minutes</p>
                        </div>
                        <button onClick={() => handleStartExam(exam)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Start Exam
                        </button>
                    </div>
                )) : <p>No exams available for your class at the moment.</p>}
            </div>
        </div>
    );
};


const ExamScreen: React.FC = () => {
    const { user } = useAuth();

    if (user?.role === Role.SISWA) {
        return <StudentExamView />;
    }

    // Placeholder for Teacher/Admin view
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Management</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p>Exam management features for Teachers would be displayed here, such as creating new exams, assigning them to classes, and monitoring progress.</p>
            </div>
        </div>
    );
};

export default ExamScreen;
