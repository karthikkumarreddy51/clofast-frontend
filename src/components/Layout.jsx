// components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx'
import '../styles/Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
