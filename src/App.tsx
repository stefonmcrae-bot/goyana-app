import { useMemo, useState } from 'react';
import { Container, Theme } from './settings/types';
import { GoYanaApp } from './components/generated/GoYanaApp';
import { GoYanaDriverApp } from './components/generated/GoYanaDriverApp';
import { GoYanaAdminApp } from './components/generated/GoYanaAdminApp';
// %IMPORT_STATEMENT

let theme: Theme = 'light';
// only use 'centered' container for standalone components, never for full page apps or websites.
let container: Container = 'none';

  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

const generatedComponent = useMemo(() => {
  if (loading) return <div>Loading...</div>;

  if (!role) return <div>Please log in</div>;

  if (role === 'customer') return <GoYanaApp />;
  if (role === 'driver') return <GoYanaDriverApp />;
  if (role === 'admin') return <GoYanaAdminApp />;

  return <div>Invalid role</div>;
}, [loading, role]);

  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  } else {
    return (
      <div className="relative">
        {/* App Mode Selector - Fixed at top */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md shadow-xl rounded-full p-1 border border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setAppMode('customer')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                appMode === 'customer'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setAppMode('driver')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                appMode === 'driver'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Driver
            </button>
            <button
              onClick={() => setAppMode('admin')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                appMode === 'admin'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
        {generatedComponent}
      </div>
    );
  }
}

export default App;
