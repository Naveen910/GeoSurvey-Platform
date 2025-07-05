import React from 'react';
import '../styles/dashboard.css';                           
import Header from '../components/Header';
import QuickActions from '../components/QuickActions';
import SystemOverview from '../components/SystemOverview';
<<<<<<< HEAD
import ContentSection from '../components/ContentSection';
import QuickLinks from '../components/QuickLinks';
import { useNavigate } from 'react-router-dom';
=======
>>>>>>> 1bd346e7f9bc7794b9af12590297d4890fc85e3e

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
<<<<<<< HEAD
      <div className="main-content-wrapper">
        <ContentSection />
        <QuickLinks onQuickLinkClick={handleQuickLinkClick} />
      </div>
=======

      
      <main className="p-6">
        
      </main>
>>>>>>> 1bd346e7f9bc7794b9af12590297d4890fc85e3e
    </div>
  );
};

export default Dashboard;
