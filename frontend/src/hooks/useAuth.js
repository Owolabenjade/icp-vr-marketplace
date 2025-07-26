import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router';
import { auth, errors } from '../services/icp';
import { usersService } from '../services';
import { errorUtils } from '../utils/helpers';

/**
 * Auth Context
 */
const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  principal: null,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [principal, setPrincipal] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for session timeout
  useEffect(() => {
    const cleanup = auth.onSessionTimeout(() => {
      handleLogout(false); // Don't show logout message for timeout
    });

    return cleanup;
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const authenticated = auth.isAuthenticated();
      
      if (authenticated) {
        const userPrincipal = auth.getPrincipal();
        setPrincipal(userPrincipal);
        setIsAuthenticated(true);

        // Try to fetch user profile
        try {
          const userProfile = await usersService.getCurrentUser();
          setUser(userProfile);
        } catch (error) {
          // User might not have created profile yet
          console.log('User profile not found:', error);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setPrincipal(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsAuthenticated(false);
      setPrincipal(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const result = await auth.login();
      
      if (result.success) {
        setPrincipal(result.principal);
        setIsAuthenticated(true);

        // Try to fetch user profile
        try {
          const userProfile = await usersService.getCurrentUser();
          setUser(userProfile);
        } catch (error) {
          // User might not have created profile yet
          setUser(null);
        }

        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: errorUtils.getUserMessage(error) 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (showMessage = true) => {
    try {
      await auth.logout();
      
      setIsAuthenticated(false);
      setPrincipal(null);
      setUser(null);

      if (showMessage) {
        // You could show a toast message here
        console.log('Logged out successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: errorUtils.getUserMessage(error) 
      };
    }
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return null;

    try {
      const userProfile = await usersService.getCurrentUser();
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    principal,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * useRequireAuth Hook - Redirects to login if not authenticated
 */
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${redirectTo}?redirect=${router.asPath}`);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

/**
 * useProfile Hook - Manages user profile operations
 */
export const useProfile = () => {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProfile = async (profileData) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to create profile');
    }

    try {
      setLoading(true);
      setError(null);

      const newUser = await usersService.createUser(profileData);
      await refreshUser(); // Refresh the user in context
      
      return { success: true, user: newUser };
    } catch (err) {
      console.error('Error creating profile:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to update profile');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedUser = await usersService.updateUser(updateData);
      await refreshUser(); // Refresh the user in context
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = errorUtils.getUserMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const checkProfileSetup = async () => {
    if (!isAuthenticated) return null;

    try {
      return await usersService.checkUserSetup();
    } catch (error) {
      console.error('Error checking profile setup:', error);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    createProfile,
    updateProfile,
    checkProfileSetup,
    refreshUser,
  };
};

/**
 * Higher-order component for route protection
 */
export const withAuth = (WrappedComponent, options = {}) => {
  const { 
    redirectTo = '/login',
    requiredRole = null,
    checkProfile = false 
  } = options;

  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push(`${redirectTo}?redirect=${router.asPath}`);
          return;
        }

        if (checkProfile && !user) {
          router.push('/profile/setup');
          return;
        }

        if (requiredRole && (!user || !user.roles?.includes(requiredRole))) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || (checkProfile && !user) || (requiredRole && (!user || !user.roles?.includes(requiredRole)))) {
      return null; // Will be redirected
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * Auth utilities
 */
export const authUtils = {
  // Check if user has completed profile setup
  hasCompleteProfile: (user) => {
    return user && user.username;
  },

  // Check if user is a creator
  isCreator: (user) => {
    return user && (user.roles?.includes('creator') || user.totalAssetsCreated > 0);
  },

  // Check if user is verified
  isVerified: (user) => {
    return user && user.isVerified;
  },

  // Get user display name
  getDisplayName: (user) => {
    if (!user) return 'Anonymous';
    return user.username || user.email || 'User';
  },

  // Get user avatar URL or fallback
  getAvatarUrl: (user) => {
    return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUtils.getDisplayName(user))}&background=3B82F6&color=fff`;
  },

  // Format user role for display
  formatRole: (role) => {
    const roleMap = {
      'creator': 'Creator',
      'verified_creator': 'Verified Creator',
      'moderator': 'Moderator',
      'admin': 'Administrator',
    };
    return roleMap[role] || 'User';
  },
};

export default useAuth;
