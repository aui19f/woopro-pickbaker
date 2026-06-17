"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const hideTimer = setTimeout(() => setVisible(false), 1550);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-white flex items-center justify-center"
      style={{
        zIndex: 9999,
        transition: "opacity 350ms ease",
        opacity: fading ? 0 : 1,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/pickbaker.png"
        alt="픽베이커"
        width={160}
        height={160}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
