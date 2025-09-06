
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { AppView } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
