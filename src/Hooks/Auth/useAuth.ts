import { useEffect } from 'react'
import { AuthState } from '../../Utils/types';
import { useAuthStore } from './useAuthStore';
import { supabase } from '../../Utils/supabase';


export function useAuth() {
  useEffect(() => {
    const getUser = async () => {
      const authState = new URLSearchParams(window.location.search).get("authState") as AuthState;
      if (authState && authState != "authenticated") useAuthStore.setState({ authState });
      
      const tokenHash = new URLSearchParams(window.location.search).get("tokenHash");
      if (tokenHash && tokenHash != "authenticated") {
        const { data } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (data?.user) useAuthStore.setState({ user: data.user });
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) useAuthStore.setState({ user: data.user });
    };

    getUser();
  }, []);
};
