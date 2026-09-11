"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useCheckoutContact() {
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [contactInfo, setContactInfo] = useState({ fullName: "", email: "", phone: "" });

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!isCurrent) return;
      setAuthStatus(user ? "authenticated" : "unauthenticated");
      if (!user) return;
      try {
        const { data: profile } = await supabase.from("profiles")
          .select("full_name, phone").eq("id", user.id).maybeSingle();
        if (isCurrent) setContactInfo((current) => ({
          fullName: current.fullName || profile?.full_name || user.user_metadata?.full_name || "",
          email: current.email || user.email || "",
          phone: current.phone || profile?.phone || "",
        }));
      } catch (error) {
        console.error("Failed to load contact information", error);
      }
    };
    load().catch((error: unknown) => {
      console.error("Failed to load authentication state", error);
      if (isCurrent) setAuthStatus("unauthenticated");
    });
    return () => { isCurrent = false; };
  }, []);

  return { authStatus, contactInfo, setContactInfo };
}
