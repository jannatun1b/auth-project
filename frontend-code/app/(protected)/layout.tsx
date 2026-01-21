'use client';

import React from 'react';
import AuthGuard from '../components/AuthGuard';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <AuthGuard>{children}</AuthGuard>;
};

export default Layout;
