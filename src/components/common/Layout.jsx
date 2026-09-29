"use client";
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

import Header from "./Header";
import Footer from "./Footer";
import BreakingNewsTicker from "../home/BreakingNewsTicker";
import { useDispatch } from 'react-redux';
import { fetchBreaking } from "@/store/slice/NewsSlice";
import { onMessageListener } from "@/services/firebase";

export default function Layout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBreaking());
  }, [dispatch]);

  useEffect(() => {
    let disposed = false;
    let unsubscribe;

    onMessageListener((payload) => {
      const title = payload.notification?.title || 'RED NEWS BHARAT';
      const body = payload.notification?.body;
      toast(body ? `${title}: ${body}` : title, { duration: 5000 });
    }).then((stopListening) => {
      if (disposed) stopListening();
      else unsubscribe = stopListening;
    }).catch((error) => console.error('Foreground notification error:', error));

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', 'Noto Sans Devanagari', system-ui, sans-serif" }}>
      {/* Breaking ticker sits at the very top — broadcast standard */}
      <BreakingNewsTicker />
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
