import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockQueues, mockUserTicket, mockProviderQueues, mockStats } from '../data/mockData';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [queues, setQueues] = useState(mockQueues);
  const [activeTicket, setActiveTicket] = useState(null);
  const [providerQueues, setProviderQueues] = useState(mockProviderQueues);
  const [stats, setStats] = useState(mockStats);

  // Simulate real-time queue updates
  useEffect(() => {
    if (!activeTicket) return;

    const interval = setInterval(() => {
      setActiveTicket(prev => {
        if (!prev || prev.position <= 1) return prev;
        const newPosition = prev.position - 1;
        const newWait = newPosition * 15; // approx wait
        return {
          ...prev,
          position: newPosition,
          currentServing: prev.currentServing + 1,
          estimatedWaitMinutes: newWait,
          status: newPosition <= 1 ? 'next' : 'waiting',
        };
      });
    }, 30000); // Update every 30 seconds for demo

    return () => clearInterval(interval);
  }, [activeTicket]);

  const joinQueue = useCallback((queueId) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return null;

    const ticket = {
      id: `tk-${Date.now()}`,
      queueId: queue.id,
      queueName: queue.name,
      provider: queue.provider,
      tokenNumber: queue.totalInQueue + 1,
      position: queue.totalInQueue - queue.currentServing + 1,
      currentServing: queue.currentServing,
      estimatedWaitMinutes: (queue.totalInQueue - queue.currentServing + 1) * queue.avgWaitTime,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
      category: queue.category,
      icon: queue.icon,
    };

    setActiveTicket(ticket);
    setQueues(prev => prev.map(q =>
      q.id === queueId ? { ...q, totalInQueue: q.totalInQueue + 1 } : q
    ));

    return ticket;
  }, [queues]);

  const joinByCode = useCallback((code) => {
    const queue = queues.find(q => q.code.toLowerCase() === code.toLowerCase());
    if (!queue) return null;
    return joinQueue(queue.id);
  }, [queues, joinQueue]);

  const leaveQueue = useCallback(() => {
    setActiveTicket(null);
  }, []);

  const callNext = useCallback((queueId) => {
    setProviderQueues(prev => prev.map(q => {
      if (q.id !== queueId) return q;
      const updatedCustomers = q.customers.map(c => {
        if (c.status === 'serving') return { ...c, status: 'completed' };
        if (c.status === 'next') return { ...c, status: 'serving' };
        return c;
      });
      const nextWaiting = updatedCustomers.find(c => c.status === 'waiting');
      if (nextWaiting) nextWaiting.status = 'next';
      return {
        ...q,
        currentServing: q.currentServing + 1,
        totalServed: q.totalServed + 1,
        customers: updatedCustomers.filter(c => c.status !== 'completed'),
      };
    }));
  }, []);

  const createQueue = useCallback((queueData) => {
    const newQueue = {
      id: `q-${Date.now()}`,
      ...queueData,
      currentServing: 0,
      totalInQueue: 0,
      totalServed: 0,
      avgWaitTime: queueData.avgWaitTime || 15,
      status: 'active',
      createdAt: new Date().toISOString(),
      customers: [],
    };
    setProviderQueues(prev => [...prev, newQueue]);
    return newQueue;
  }, []);

  return (
    <QueueContext.Provider value={{
      queues,
      activeTicket,
      providerQueues,
      stats,
      joinQueue,
      joinByCode,
      leaveQueue,
      callNext,
      createQueue,
      setActiveTicket,
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within QueueProvider');
  return context;
}
