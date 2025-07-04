import React, { useState } from 'react';
import Header from '../components/Header';
import QuickActions from '../components/QuickActions';
import SystemOverview from '../components/SystemOverview';
import ContentSection from '../components/ContentSection';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('All Content');
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleView = (mode) => {
    setView(mode); // mode is 'grid' or 'list'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <QuickActions />
      <SystemOverview />
      <ContentSection />

      
    </div>
  );
};

export default Dashboard;
