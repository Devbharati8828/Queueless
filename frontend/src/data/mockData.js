// Mock data for QueueLess MVP - simulates backend responses

export const mockQueues = [
  {
    id: 'q-001',
    name: 'City General Hospital - OPD',
    provider: 'City General Hospital',
    category: 'Healthcare',
    code: 'CGH-OPD',
    description: 'Outpatient Department - General Consultation',
    currentServing: 12,
    totalInQueue: 28,
    avgWaitTime: 15, // minutes per person
    status: 'active',
    operatingHours: '8:00 AM - 4:00 PM',
    address: '45, MG Road, Sector 12, New Delhi',
    createdAt: '2026-05-13T03:00:00Z',
    maxCapacity: 50,
    icon: '🏥'
  },
  {
    id: 'q-002',
    name: 'State Bank - Account Services',
    provider: 'State Bank of India',
    category: 'Banking',
    code: 'SBI-ACC',
    description: 'Account opening, modifications, and general queries',
    currentServing: 5,
    totalInQueue: 14,
    avgWaitTime: 20,
    status: 'active',
    operatingHours: '10:00 AM - 3:00 PM',
    address: '12, Nehru Place, New Delhi',
    createdAt: '2026-05-13T04:00:00Z',
    maxCapacity: 30,
    icon: '🏦'
  },
  {
    id: 'q-003',
    name: 'Passport Seva Kendra',
    provider: 'Ministry of External Affairs',
    category: 'Government',
    code: 'PSK-DEL',
    description: 'Passport application and renewal services',
    currentServing: 34,
    totalInQueue: 67,
    avgWaitTime: 25,
    status: 'active',
    operatingHours: '9:00 AM - 5:00 PM',
    address: 'Bhikaji Cama Place, New Delhi',
    createdAt: '2026-05-13T03:30:00Z',
    maxCapacity: 100,
    icon: '🏛️'
  },
  {
    id: 'q-004',
    name: 'Dr. Sharma Dental Clinic',
    provider: 'Dr. Rajesh Sharma',
    category: 'Healthcare',
    code: 'DSC-DEN',
    description: 'Dental checkup and consultation',
    currentServing: 2,
    totalInQueue: 6,
    avgWaitTime: 30,
    status: 'active',
    operatingHours: '10:00 AM - 7:00 PM',
    address: '78, Green Park Market, New Delhi',
    createdAt: '2026-05-13T04:30:00Z',
    maxCapacity: 15,
    icon: '🦷'
  },
  {
    id: 'q-005',
    name: 'RTO - Driving License',
    provider: 'Regional Transport Office',
    category: 'Government',
    code: 'RTO-DL',
    description: 'Driving license application and renewal',
    currentServing: 18,
    totalInQueue: 42,
    avgWaitTime: 12,
    status: 'active',
    operatingHours: '9:30 AM - 4:30 PM',
    address: 'Loni Road, Shahdara, Delhi',
    createdAt: '2026-05-13T04:00:00Z',
    maxCapacity: 80,
    icon: '🚗'
  },
  {
    id: 'q-006',
    name: 'Wellness Pharmacy',
    provider: 'Wellness Pharmacy Chain',
    category: 'Retail',
    code: 'WPC-MED',
    description: 'Prescription pickup and consultation',
    currentServing: 3,
    totalInQueue: 8,
    avgWaitTime: 5,
    status: 'active',
    operatingHours: '8:00 AM - 10:00 PM',
    address: 'Connaught Place, New Delhi',
    createdAt: '2026-05-13T02:30:00Z',
    maxCapacity: 20,
    icon: '💊'
  }
];

export const mockUserTicket = {
  id: 'tk-2847',
  queueId: 'q-001',
  queueName: 'City General Hospital - OPD',
  provider: 'City General Hospital',
  tokenNumber: 28,
  position: 16,
  currentServing: 12,
  estimatedWaitMinutes: 60,
  joinedAt: '2026-05-13T06:45:00Z',
  status: 'waiting', // waiting, next, serving, completed
  category: 'Healthcare',
  icon: '🏥'
};

export const mockProviderQueues = [
  {
    id: 'q-001',
    name: 'General Consultation',
    status: 'active',
    currentServing: 12,
    totalInQueue: 28,
    totalServed: 11,
    avgWaitTime: 15,
    maxCapacity: 50,
    createdAt: '2026-05-13T03:00:00Z',
    customers: [
      { id: 'c-1', name: 'Rahul Kumar', token: 12, status: 'serving', joinedAt: '2026-05-13T03:15:00Z' },
      { id: 'c-2', name: 'Priya Sharma', token: 13, status: 'next', joinedAt: '2026-05-13T03:22:00Z' },
      { id: 'c-3', name: 'Amit Patel', token: 14, status: 'waiting', joinedAt: '2026-05-13T03:30:00Z' },
      { id: 'c-4', name: 'Sneha Gupta', token: 15, status: 'waiting', joinedAt: '2026-05-13T03:35:00Z' },
      { id: 'c-5', name: 'Vikram Singh', token: 16, status: 'waiting', joinedAt: '2026-05-13T03:42:00Z' },
      { id: 'c-6', name: 'Deepa Reddy', token: 17, status: 'waiting', joinedAt: '2026-05-13T03:50:00Z' },
      { id: 'c-7', name: 'Arjun Nair', token: 18, status: 'waiting', joinedAt: '2026-05-13T03:55:00Z' },
      { id: 'c-8', name: 'Kavita Joshi', token: 19, status: 'waiting', joinedAt: '2026-05-13T04:02:00Z' },
    ]
  },
  {
    id: 'q-007',
    name: 'Lab Tests',
    status: 'active',
    currentServing: 5,
    totalInQueue: 12,
    totalServed: 4,
    avgWaitTime: 10,
    maxCapacity: 25,
    createdAt: '2026-05-13T03:30:00Z',
    customers: [
      { id: 'c-9', name: 'Sanjay Mehta', token: 5, status: 'serving', joinedAt: '2026-05-13T04:00:00Z' },
      { id: 'c-10', name: 'Anita Desai', token: 6, status: 'next', joinedAt: '2026-05-13T04:10:00Z' },
      { id: 'c-11', name: 'Rohit Verma', token: 7, status: 'waiting', joinedAt: '2026-05-13T04:15:00Z' },
    ]
  },
  {
    id: 'q-008',
    name: 'Pharmacy Pickup',
    status: 'paused',
    currentServing: 8,
    totalInQueue: 8,
    totalServed: 7,
    avgWaitTime: 3,
    maxCapacity: 15,
    createdAt: '2026-05-13T03:00:00Z',
    customers: [
      { id: 'c-12', name: 'Meera Iyer', token: 8, status: 'serving', joinedAt: '2026-05-13T05:00:00Z' },
    ]
  }
];

export const mockStats = {
  totalQueuesManaged: 3,
  totalCustomersServed: 234,
  averageWaitTime: 12,
  satisfactionRate: 94,
  peakHour: '11:00 AM',
  todayServed: 22,
  weeklyGrowth: 18,
};

export const categoryColors = {
  Healthcare: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  Banking: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  Government: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Retail: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  Education: { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
};
