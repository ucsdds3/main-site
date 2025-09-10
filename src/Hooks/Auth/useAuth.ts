import { useEffect } from 'react'
import { AuthState } from '../../Utils/types';
import { useAuthStore } from './useAuthStore';
import { supabase } from '../../Utils/supabase';
import { useSiteHandler } from '../useSiteHandler';
import { User } from '@supabase/supabase-js';


export function useAuth() {
  const {navigate} = useSiteHandler();

  useEffect(() => {
    const getUser = async () => {
      const authState = new URLSearchParams(window.location.search).get("authState") as AuthState;
      if (authState && authState != "authenticated") useAuthStore.setState({ authState });

      const foundUser = (user: User) => {
        useAuthStore.setState({ user, authState: "authenticated" });
        navigate({ pathname: "/", subdomain: "members" });
      }
      
      const tokenHash = new URLSearchParams(window.location.search).get("tokenHash");
      if (tokenHash && tokenHash != "authenticated") {
        const { data } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (data?.user) return foundUser(data.user);
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) return foundUser(data.user);
      
      const user = localStorage.getItem("user");
      if (user) return foundUser(JSON.parse(user));
    };

    getUser();
  }, []);
};
