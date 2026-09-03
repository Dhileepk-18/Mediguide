import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Stethoscope, Pill, User } from 'lucide-react';

export const BottomTabBar = () => {
  const tabs = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptoms', path: '/symptom-checker', icon: Sparkles },
    { name: 'Care', path: '/doctors', icon: Stethoscope },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B3441] border-t border-white/10 px-2 py-1.5 flex items-center justify-around select-none backdrop-blur-lg"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-[#9EBAD1] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#C9A24D]' : 'text-[#9EBAD1]'}`} />
                <span>{tab.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
