// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useCart } from '@/contexts/CartContext';
// import { Header } from './Header';
// import { CartSidebar } from '../cart/CartSidebar';
// import { SearchModal } from '../search/SearchModal';
// import { DynamicLayout } from './DynamicLayout';

// interface ClientLayoutProps {
//   children: React.ReactNode;
// }

// export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
//   const { state, dispatch } = useCart();
//   const router = useRouter();
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   // Add keyboard shortcut for search (Ctrl+K or Cmd+K)
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
//         event.preventDefault();
//         setIsSearchOpen(true);
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   const handleCartClick = () => {
//     dispatch({ type: 'TOGGLE_CART' });
//   };

//   const handleSearchClick = () => {
//     setIsSearchOpen(true);
//   };

//   const handleSearchClose = () => {
//     setIsSearchOpen(false);
//   };

//   const handleLogoClick = () => {
//     router.push('/');
//   };

//   return (
//     <DynamicLayout>
//       <Header 
//         cartItemCount={state.itemCount}
//         onCartClick={handleCartClick}
//         onSearchClick={handleSearchClick}
//         onLogoClick={handleLogoClick}
//       />
//       {children}
//       <CartSidebar />
//       <SearchModal isOpen={isSearchOpen} onClose={handleSearchClose} />
//     </DynamicLayout>
//   );
// };


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Header } from './Header';
import { CartSidebar } from '../cart/CartSidebar';
import { SearchModal } from '../search/SearchModal';
import { DynamicLayout } from './DynamicLayout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isAdminRoute = pathname.startsWith('/admin');

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCartClick = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <DynamicLayout>
      {!isAdminRoute && (
        <>
          <Header 
            cartItemCount={state.itemCount}
            onCartClick={handleCartClick}
            onSearchClick={handleSearchClick}
            onLogoClick={handleLogoClick}
          />
        </>
      )}

      {children}

      {!isAdminRoute && (
        <>
          <CartSidebar />
          <SearchModal isOpen={isSearchOpen} onClose={handleSearchClose} />
        </>
      )}
    </DynamicLayout>
  );
};
