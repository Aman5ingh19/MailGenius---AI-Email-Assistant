'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { requestFCMToken, onForegroundMessage } from '@/lib/firebase/client';

export default function NotificationBanner() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [incomingMsg, setIncomingMsg] = useState(null);

  useEffect(() => {
    // Check if permission already granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        requestFCMToken().then((tok) => {
          if (tok) setToken(tok);
        });
      }
    }

    // Listen for foreground FCM messages
    const unsubscribe = onForegroundMessage((payload) => {
      setIncomingMsg(payload.notification);
      setTimeout(() => setIncomingMsg(null), 6000);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const fcmToken = await requestFCMToken();
      if (fcmToken) {
        setToken(fcmToken);
        setStatusMsg('Push notifications enabled successfully!');
      } else {
        setStatusMsg('Notifications could not be enabled. Check browser permissions or Firebase config.');
      }
    } catch (e) {
      setStatusMsg('Error enabling notifications: ' + e.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleSendTestPush = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test',
          title: '⚡ MailGenius AI Ready!',
          message: 'Real-time Firebase Cloud Messaging push notification is live.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Test push sent to device!');
      } else {
        setStatusMsg(data.reason || data.error || 'Failed to send test push.');
      }
    } catch (err) {
      setStatusMsg('Network error sending push: ' + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/20 p-4 backdrop-blur-md text-slate-200">
      {/* Incoming Live Foreground Notification Toast */}
      {incomingMsg && (
        <div className="mb-3 p-3 rounded-xl bg-blue-600/90 text-white flex items-center gap-3 shadow-lg animate-bounce">
          <BellRing className="w-5 h-5 flex-shrink-0 animate-spin" />
          <div className="text-sm">
            <p className="font-bold">{incomingMsg.title}</p>
            <p className="text-xs opacity-90">{incomingMsg.body}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {token ? <BellRing className="w-5 h-5 text-emerald-400" /> : <Bell className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
              Firebase Cloud Messaging (FCM)
              {token ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Live & Connected
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  Ready to connect
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Receive real-time push notifications when AI completes email replies or background jobs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!token ? (
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md hover:shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              {loading ? 'Enabling...' : 'Enable Push Alerts'}
            </button>
          ) : (
            <button
              onClick={handleSendTestPush}
              disabled={loading}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm hover:border-slate-600 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              {loading ? 'Sending...' : 'Test FCM Push'}
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="mt-2 text-xs text-blue-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
}
