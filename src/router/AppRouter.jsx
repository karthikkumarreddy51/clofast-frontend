// router/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Profiles from '../components/Profiles';
import Documents from '../components/Documents';
import CRMIntegration from '../components/CRMIntegration';
import Reconciliation from '../components/Reconciliation';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Layout includes the sidebar and an Outlet */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Profiles />} />
          <Route path="profiles" element={<Profiles />} />
          <Route path="documents" element={<Documents />} />
          <Route path="crm-integration" element={<CRMIntegration />} />
          <Route path="reconciliation" element={<Reconciliation />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
