
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppView } from './types';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import Layout from './components/layout/Layout';
import ClassesScreen from './screens/ClassesScreen';
import QuestionBankScreen from './screens/QuestionBankScreen';
import ExamScreen from './screens/ExamScreen';
import ResultsScreen from './screens/ResultsScreen';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<AppView>({ type: 'dashboard' });

    if (!user) {
        return <LoginScreen />;
    }

    const renderView = () => {
        switch (currentView.type) {
            case 'dashboard':
                return <DashboardScreen />;
            case 'classes':
                return <ClassesScreen />;
            case 'questionBank':
                return <QuestionBankScreen />;
            case 'exams':
                return <ExamScreen />;
            case 'results':
                return <ResultsScreen />;
            default:
                return <DashboardScreen />;
        }
    };

    return (
        <Layout currentView={currentView} setCurrentView={setCurrentView}>
            {renderView()}
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
