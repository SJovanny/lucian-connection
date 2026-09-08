"use client";

import Script from "next/script";
import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => number;
      reset: (widgetId?: number) => void;
      remove: (widgetId: number) => void;
    };
  }
}

type HCaptchaProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
  resetKey: number;
};

const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export function HCaptcha({ onVerify, onExpire, resetKey }: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const containerId = useId().replace(/:/g, "");
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  }, [onExpire, onVerify]);

  useEffect(() => {
    const render = () => {
      if (!siteKey || !window.hcaptcha || !containerRef.current || widgetIdRef.current !== null) return;

      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current(),
        "error-callback": () => onExpireRef.current(),
      });
    };

    render();
    window.addEventListener("hcaptcha-ready", render);

    return () => {
      window.removeEventListener("hcaptcha-ready", render);
      if (widgetIdRef.current !== null) window.hcaptcha?.remove(widgetIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (widgetIdRef.current !== null) window.hcaptcha?.reset(widgetIdRef.current);
  }, [resetKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event("hcaptcha-ready"))}
      />
      <div className="flex justify-center overflow-x-auto">
        <div ref={containerRef} id={containerId} />
      </div>
    </>
  );
}
