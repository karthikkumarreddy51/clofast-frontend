import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Profiles from "./components/profiles";
import DocumentLibrary from "./components/DocumentLibrary";
import CRMIntegration from "./components/CRMIntegration";

const Layout = () => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        <Routes>
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/documents" element={<DocumentLibrary />} />
          <Route path="/crm" element={<CRMIntegration />} />
          <Route path="*" element={<Profiles />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
