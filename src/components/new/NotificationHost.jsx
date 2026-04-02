"use client";

import { useEffect, useState, useRef } from 'react';
import '../../styles/new/notifications.css';

// RELOAD_TAG: 2024-03-18-11-05
export default function NotificationHost() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const shownIds = useRef(new Set());

  const addNotification = (notif) => {
    if (shownIds.current.has(notif.id)) return;
    shownIds.current.add(notif.id);
    
    setNotifications((prev) => [...prev, { ...notif, hiding: false }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notif.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, hiding: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  useEffect(() => {
    setMounted(true);
    const pollEvents = async () => {
      try {
        const res = await fetch('/api/v2/events');
        if (!res.ok) return;
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          data.events.forEach((ev) => {
            if (ev.type === 'reward:earned') {
              addNotification({
                id: ev.id,
                title: 'Recompensa',
                message: ev.payload.message,
                icon: ev.payload.icon || '🏆',
                type: 'reward'
              });
            } else if (ev.type === 'user:registered') {
              addNotification({
                id: ev.id,
                title: 'Nuevo Miembro',
                message: `¡Bienvenido, ${ev.payload.name}!`,
                icon: '👋',
                type: 'info'
              });
            }
          });
        }
      } catch (err) {
        console.error('Failed to poll events:', err);
      }
    };

    const interval = setInterval(pollEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`toast ${n.type} ${n.hiding ? 'hiding' : ''}`}
        >
          <div className="toast-icon">{n.icon}</div>
          <div className="toast-content">
            <div className="toast-title">{n.title}</div>
            <div className="toast-message">{n.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
