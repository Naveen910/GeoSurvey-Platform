import React from 'react';
import '../styles/dashboard.css';                           
import Header from '../components/Header';
import QuickActions from '../components/QuickActions';
import SystemOverview from '../components/SystemOverview';
import ContentSection from '../components/ContentSection';
import QuickLinks from '../components/QuickLinks';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();

  // Pass the navigation handler as a prop to QuickLinks
  const handleQuickLinkClick = (linkName) => {
    if (linkName === 'Map Viewer') {
      navigate('/map-viewer');
    }
    // Add more navigation logic here if needed
  };

  return (
    <div className="page-container">
      <Header />
      <QuickActions />
      <SystemOverview />

      <div className="main-content-wrapper">
        <ContentSection />
        <QuickLinks onQuickLinkClick={handleQuickLinkClick} />
      </div>


      
      <main className="p-6">
        
      </main>
    </div>
  );
};

export default Dashboard;
