
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Ujian, BankSoal, QuestionType, Difficulty } from '../types';

const mockExams: Ujian[] = [
    { id: 1, kelas_id: 101, judul: 'Ujian Tengah Semester - Sejarah', deskripsi: 'Ujian mencakup bab 1-3.', waktu_mulai: '2024-10-26T10:00:00', durasi_menit: 60, aturan_random: true, author_id: 2, soal_ids: [1, 2] }
];
const mockQuestions: BankSoal[] = [
    { id: 1, mapel: 'Sejarah', tipe: QuestionType.MCQ, pertanyaan: 'Siapakah pahlawan yang memproklamasikan kemerdekaan Indonesia?', opsi_json: [{value: 'a', text: 'Soekarno'}, {value: 'b', text: 'Hatta'}, {value: 'c', text: 'Soekarno-Hatta'}, {value: 'd', text: 'Sutan Sjahrir'}], kunci_jawaban: 'c', tingkat_kesulitan: Difficulty.MUDAH, created_by: 2 },
    { id: 2, mapel: 'Sejarah', tipe: QuestionType.ESAI, pertanyaan: 'Jelaskan latar belakang terjadinya Perang Dunia II.', tingkat_kesulitan: Difficulty.SULIT, created_by: 2 },
];


const ExamTaker: React.FC<{ exam: Ujian, onFinish: () => void }> = ({ exam, onFinish }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(exam.durasi_menit * 60);
    const [answers, setAnswers] = useState<{[key: number]: string}>({});

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exam.id, onFinish]);

    const handleAnswerChange = (soalId: number, answer: string) => {
        const newAnswers = {...answers, [soalId]: answer};
        setAnswers(newAnswers);
        // Autosave logic would go here
        console.log("Autosaving answer:", newAnswers);
    }
    
    const currentQuestion = mockQuestions.find(q => q.id === exam.soal_ids[currentQuestionIndex]);

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
                    <p className="text-lg mb-4">Question {currentQuestionIndex + 1} of {exam.soal_ids.length}</p>
                    <p className="font-semibold text-xl mb-6">{currentQuestion.pertanyaan}</p>
                    {currentQuestion.tipe === QuestionType.MCQ && currentQuestion.opsi_json && (
                        <div className="space-y-3">
                            {currentQuestion.opsi_json.map(opt => (
                                <label key={opt.value} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name={`q_${currentQuestion.id}`} value={opt.value} className="mr-3" 
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}/>
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
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                         />
                    )}
                </div>
            )}
            
            <div className="flex justify-between mt-8">
                <button 
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(i => i-1)}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >Previous</button>

                {currentQuestionIndex === exam.soal_ids.length - 1 ? (
                    <button onClick={onFinish} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Submit Exam</button>
                ) : (
                    <button onClick={() => setCurrentQuestionIndex(i => i+1)} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Next</button>
                )}
            </div>
        </div>
    );
};


const StudentExamView: React.FC = () => {
    const [takingExam, setTakingExam] = useState<Ujian | null>(null);

    if (takingExam) {
        return <ExamTaker exam={takingExam} onFinish={() => setTakingExam(null)} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Exams</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {mockExams.map(exam => (
                    <div key={exam.id} className="flex justify-between items-center p-4 border-b">
                        <div>
                            <h3 className="font-semibold text-lg">{exam.judul}</h3>
                            <p className="text-sm text-gray-600">{exam.deskripsi}</p>
                            <p className="text-sm text-gray-500">Duration: {exam.durasi_menit} minutes</p>
                        </div>
                        <button onClick={() => setTakingExam(exam)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Start Exam
                        </button>
                    </div>
                ))}
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
