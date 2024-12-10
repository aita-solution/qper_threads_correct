// components/Header.js
import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Header = () => {
  return (
    <div 
      className="flex items-center justify-between p-4"
      style={{
        background: 'linear-gradient(180deg, #fe6f00 0%, #ffffff 100%)'
      }}
    >
      <div className="flex items-center">
        <Menu className="w-6 h-6 mr-4" color="#ffffff" />
        <div className="flex items-center justify-center bg-white rounded-lg">
          <img 
            src="/assets/images/icon-pb.icon" 
            alt="Qper Construction Logo"
            width="32"
            height="32"
            style={{
              maxWidth: '32px',
              maxHeight: '32px'
            }}
          />
        </div>
        <h1 className="ml-3 font-bold text-xl text-white">Qper CONSTRUCTION</h1>
      </div>
      <Bell className="w-6 h-6" color="#ffffff" />
    </div>
  );
};

export default Header;
