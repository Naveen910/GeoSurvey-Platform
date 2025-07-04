import React from 'react';
import Header from '../components/Header';
import QuickActions from '../components/QuickActions';
import SystemOverview from '../components/SystemOverview';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <QuickActions />
      <SystemOverview />

      
      <main className="p-6">
        
      </main>
    </div>
  );
};
export default Dashboard;
