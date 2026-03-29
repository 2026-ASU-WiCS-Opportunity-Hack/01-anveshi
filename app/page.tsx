'use client';

import React, { useEffect, useMemo, useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
  }

  interface SpeechRecognitionEvent {
    results: {
      [key: number]: {
        [key: number]: {
          transcript: string;
        };
      };
      length: number;
    };
  }
}

type Role = 'Admin' | 'Staff';
type ActiveTab =
  | 'dashboard'
  | 'clients'
  | 'profile'
  | 'ai-reporting'
  | 'form-config';

type ProfilePanel = 'details' | 'ai-notes';

type FieldConfig = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  required: boolean;
  enabled: boolean;
  isBuiltIn: boolean;
  options?: string[];
};

type Client = {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  demographics: {
    gender: string;
    language: string;
    householdSize: string;
    program: string;
    status: string;
  };
  customFields?: Record<string, string>;
};

type ServiceEntry = {
  id: string;
  clientId: string;
  date: string;
  serviceType: string;
  staff: string;
  notes: string;
};

type NewClientForm = {
  name: string;
  dob: string;
  phone: string;
  email: string;
  gender: string;
  language: string;
  householdSize: string;
  program: string;
  status: string;
};

type NewServiceForm = {
  clientId: string;
  date: string;
  serviceType: string;
  staff: string;
  notes: string;
};

type ServiceFieldConfig = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  required: boolean;
  enabled: boolean;
};

const defaultServiceFieldConfig: ServiceFieldConfig[] = [
  { key: 'date',        label: 'Date',         type: 'date',     required: true,  enabled: true },
  { key: 'serviceType', label: 'Service Type', type: 'text',     required: true,  enabled: true },
  { key: 'staff',       label: 'Staff Member', type: 'text',     required: false, enabled: true },
  { key: 'notes',       label: 'Notes',        type: 'textarea', required: false, enabled: true },
];


const defaultFieldConfig: FieldConfig[] = [
  { key: 'name',          label: 'Name',           type: 'text',   required: true,  enabled: true, isBuiltIn: true },
  { key: 'dob',           label: 'Date of Birth',  type: 'date',   required: true,  enabled: true, isBuiltIn: true },
  { key: 'phone',         label: 'Phone',          type: 'text',   required: false, enabled: true, isBuiltIn: true },
  { key: 'email',         label: 'Email',          type: 'text',   required: false, enabled: true, isBuiltIn: true },
  { key: 'gender',        label: 'Gender',         type: 'text',   required: false, enabled: true, isBuiltIn: true },
  { key: 'language',      label: 'Language',       type: 'text',   required: false, enabled: true, isBuiltIn: true },
  { key: 'householdSize', label: 'Household Size', type: 'number', required: false, enabled: true, isBuiltIn: true },
  { key: 'program',       label: 'Program',        type: 'text',   required: false, enabled: true, isBuiltIn: true },
  { key: 'status',        label: 'Status',         type: 'text',   required: false, enabled: true, isBuiltIn: true },
];

const seedClients: Client[] = [
  {
    id: 'CL-1001',
    name: 'Maria Lopez',
    dob: '1987-05-14',
    phone: '(555) 203-9912',
    email: 'maria.lopez@example.org',
    demographics: {
      gender: 'Female',
      language: 'Spanish',
      householdSize: '4',
      program: 'Food Assistance',
      status: 'Active',
    },
  },
  {
    id: 'CL-1002',
    name: 'Daniel Brooks',
    dob: '1979-11-02',
    phone: '(555) 392-1119',
    email: 'daniel.brooks@example.org',
    demographics: {
      gender: 'Male',
      language: 'English',
      householdSize: '2',
      program: 'Therapy',
      status: 'Active',
    },
  },
  {
    id: 'CL-1003',
    name: 'Asha Patel',
    dob: '1993-02-21',
    phone: '(555) 611-3312',
    email: 'asha.patel@example.org',
    demographics: {
      gender: 'Female',
      language: 'English',
      householdSize: '1',
      program: 'Youth Mentoring',
      status: 'Follow-up',
    },
  },
  {
    id: 'CL-1004',
    name: 'Buddy Carter',
    dob: '2021-09-10',
    phone: '(555) 777-1818',
    email: 'foster.buddy@example.org',
    demographics: {
      gender: 'Male',
      language: 'N/A',
      householdSize: 'N/A',
      program: 'Pet Rescue',
      status: 'In Foster Care',
    },
  },
  {
    id: 'CL-1005',
    name: 'Riya Patel',
    dob: '1993-02-22',
    phone: '(555) 611-3311',
    email: 'riya.patel@example.org',
    demographics: {
      gender: 'Female',
      language: 'Hindi',
      householdSize: '3',
      program: 'Youth Mentoring',
      status: 'Follow-up',
    },
  },
  {
    id: 'CL-1006',
    name: 'James Turner',
    dob: '1985-08-03',
    phone: '(555) 412-7780',
    email: 'james.turner@example.org',
    demographics: {
      gender: 'Male',
      language: 'English',
      householdSize: '5',
      program: 'Housing Referral',
      status: 'Active',
    },
  },
  {
    id: 'CL-1007',
    name: 'Fatima Hassan',
    dob: '1990-01-18',
    phone: '(555) 844-2106',
    email: 'fatima.hassan@example.org',
    demographics: {
      gender: 'Female',
      language: 'Arabic',
      householdSize: '4',
      program: 'Food Assistance',
      status: 'Active',
    },
  },
  {
    id: 'CL-1008',
    name: 'Kevin Nguyen',
    dob: '2001-06-27',
    phone: '(555) 290-4417',
    email: 'kevin.nguyen@example.org',
    demographics: {
      gender: 'Male',
      language: 'English',
      householdSize: '1',
      program: 'Employment Support',
      status: 'Pending Intake',
    },
  },
  {
    id: 'CL-1009',
    name: 'Sofia Ramirez',
    dob: '1988-12-09',
    phone: '(555) 732-1980',
    email: 'sofia.ramirez@example.org',
    demographics: {
      gender: 'Female',
      language: 'Spanish',
      householdSize: '2',
      program: 'Therapy',
      status: 'Active',
    },
  },
  {
    id: 'CL-1010',
    name: 'Ethan Walker',
    dob: '2010-04-15',
    phone: '(555) 663-5519',
    email: 'guardian.ethan@example.org',
    demographics: {
      gender: 'Male',
      language: 'English',
      householdSize: '3',
      program: 'Youth Mentoring',
      status: 'Active',
    },
  },
  {
    id: 'CL-1011',
    name: 'Priya Nair',
    dob: '1975-09-30',
    phone: '(555) 508-9921',
    email: 'priya.nair@example.org',
    demographics: {
      gender: 'Female',
      language: 'Malayalam',
      householdSize: '2',
      program: 'Benefits Navigation',
      status: 'Follow-up',
    },
  },
  {
    id: 'CL-1012',
    name: 'Carlos Mendoza',
    dob: '1982-03-11',
    phone: '(555) 381-2240',
    email: 'carlos.mendoza@example.org',
    demographics: {
      gender: 'Male',
      language: 'Spanish',
      householdSize: '6',
      program: 'Food Assistance',
      status: 'Active',
    },
  },
  {
    id: 'CL-1013',
    name: 'Linh Tran',
    dob: '1996-07-08',
    phone: '(555) 918-1142',
    email: 'linh.tran@example.org',
    demographics: {
      gender: 'Female',
      language: 'Vietnamese',
      householdSize: '2',
      program: 'Case Review',
      status: 'Pending Documents',
    },
  },
  {
    id: 'CL-1014',
    name: 'Robert Jenkins',
    dob: '1968-05-19',
    phone: '(555) 470-3308',
    email: 'robert.jenkins@example.org',
    demographics: {
      gender: 'Male',
      language: 'English',
      householdSize: '1',
      program: 'Housing Referral',
      status: 'Waitlisted',
    },
  },
];

const seedServices: ServiceEntry[] = [
  {
    id: 'SV-1',
    clientId: 'CL-1001',
    date: '2026-03-26',
    serviceType: 'Food Pantry Visit',
    staff: 'A. Rivera',
    notes: 'Provided pantry box and discussed WIC referral. Follow up next week.',
  },
  {
    id: 'SV-2',
    clientId: 'CL-1001',
    date: '2026-03-20',
    serviceType: 'Intake Assessment',
    staff: 'J. Thompson',
    notes: 'Initial registration completed. Household includes two adults and two children.',
  },
  {
    id: 'SV-3',
    clientId: 'CL-1002',
    date: '2026-03-25',
    serviceType: 'Therapy Session',
    staff: 'D. Lee',
    notes: 'Progress noted in stress management goals. Recommended one more session this month.',
  },
  {
    id: 'SV-4',
    clientId: 'CL-1003',
    date: '2026-03-24',
    serviceType: 'Mentoring Check-In',
    staff: 'K. Shah',
    notes: 'Reviewed weekly goals and school attendance. Positive engagement.',
  },
  {
    id: 'SV-5',
    clientId: 'CL-1004',
    date: '2026-03-21',
    serviceType: 'Medical Intake',
    staff: 'S. Young',
    notes: 'Vaccination record uploaded. Foster placement remains stable.',
  },
  {
    id: 'SV-6',
    clientId: 'CL-1005',
    date: '2026-03-22',
    serviceType: 'Mentoring Check-In',
    staff: 'K. Shah',
    notes: 'Client discussed school transition and requested weekly check-ins.',
  },
  {
    id: 'SV-7',
    clientId: 'CL-1006',
    date: '2026-03-27',
    serviceType: 'Housing Referral',
    staff: 'M. Collins',
    notes: 'Reviewed rental assistance options and submitted referral to partner agency.',
  },
  {
    id: 'SV-8',
    clientId: 'CL-1007',
    date: '2026-03-23',
    serviceType: 'Food Pantry Visit',
    staff: 'A. Rivera',
    notes: 'Provided pantry box for family of four and scheduled benefits screening.',
  },
  {
    id: 'SV-9',
    clientId: 'CL-1008',
    date: '2026-03-28',
    serviceType: 'Intake Assessment',
    staff: 'J. Thompson',
    notes: 'Completed intake for employment support program. Awaiting resume upload.',
  },
  {
    id: 'SV-10',
    clientId: 'CL-1009',
    date: '2026-03-26',
    serviceType: 'Therapy Session',
    staff: 'D. Lee',
    notes: 'Discussed anxiety management and set next appointment for early April.',
  },
  {
    id: 'SV-11',
    clientId: 'CL-1010',
    date: '2026-03-19',
    serviceType: 'Mentoring Check-In',
    staff: 'K. Shah',
    notes: 'Guardian joined part of session. Focused on attendance and confidence goals.',
  },
  {
    id: 'SV-12',
    clientId: 'CL-1011',
    date: '2026-03-18',
    serviceType: 'Case Review',
    staff: 'L. Morris',
    notes: 'Reviewed benefits paperwork and identified missing verification documents.',
  },
  {
    id: 'SV-13',
    clientId: 'CL-1012',
    date: '2026-03-27',
    serviceType: 'Food Pantry Visit',
    staff: 'A. Rivera',
    notes: 'Large household received pantry support and referral for utility assistance.',
  },
  {
    id: 'SV-14',
    clientId: 'CL-1013',
    date: '2026-03-25',
    serviceType: 'Case Review',
    staff: 'L. Morris',
    notes: 'Client pending proof of income. Follow-up requested within five business days.',
  },
  {
    id: 'SV-15',
    clientId: 'CL-1014',
    date: '2026-03-24',
    serviceType: 'Housing Referral',
    staff: 'M. Collins',
    notes: 'Added client to waitlist for transitional housing and reviewed next steps.',
  },
];

const serviceTypeOptions = [
  'Intake Assessment',
  'Food Pantry Visit',
  'Therapy Session',
  'Mentoring Check-In',
  'Medical Intake',
  'Case Review',
  'Housing Referral',
];

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function shellCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: '#ffffff',
    border: '1px solid #e6e8ec',
    borderRadius: 20,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
    ...extra,
  };
}

function tileCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: '#ffffff',
    border: '1px solid #dde7ea',
    borderTop: '4px solid #9ed0d7',
    borderRadius: 18,
    padding: 18,
    ...extra,
  };
}

function primaryButton(extra?: React.CSSProperties): React.CSSProperties {
  return {
    border: '1px solidrgb(171, 176, 255)',
    background: '#2563eb',
    color: '#ffffff',
    borderRadius: 14,
    padding: '10px 16px',
    fontWeight: 700,
    cursor: 'pointer',
    ...extra,
  };
}

function secondaryButton(extra?: React.CSSProperties): React.CSSProperties {
  return {
    border: '1px solid #cfd8dc',
    background: '#ffffff',
    color: '#24364b',
    borderRadius: 14,
    padding: '10px 16px',
    fontWeight: 600,
    cursor: 'pointer',
    ...extra,
  };
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%',
    border: '1px solid #cfd8dc',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    ...extra,
  };
}

function textAreaStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%',
    minHeight: 140,
    border: '1px solid #cfd8dc',
    borderRadius: 12,
    padding: '12px',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    ...extra,
  };
}

function badgeStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    display: 'inline-block',
    border: '1px solid #d9e3e7',
    background: '#ffffff',
    color: '#516273',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    ...extra,
  };
}

function modalOverlayStyle(show: boolean): React.CSSProperties {
  return {
    display: show ? 'flex' : 'none',
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000,
  };
}


function generateNoteSummary(rawText: string) {
  const lower = rawText.toLowerCase();

  const serviceType = lower.includes('food')
    ? 'Food Pantry Visit'
    : lower.includes('therapy')
    ? 'Therapy Session'
    : lower.includes('mentor')
    ? 'Mentoring Check-In'
    : 'Case Review';

  const risk =
    lower.includes('urgent') || lower.includes('unsafe') || lower.includes('risk')
      ? 'High'
      : lower.includes('stressed') || lower.includes('follow up')
      ? 'Medium'
      : 'Low';

  const followUp = lower.includes('next week')
    ? 'Follow up next week'
    : lower.includes('tomorrow')
    ? 'Follow up tomorrow'
    : 'Review in 7 days';

  return {
    summary:
      rawText.length > 200 ? `${rawText.slice(0, 200)}...` : rawText || 'No note entered.',
    serviceType,
    risk,
    followUp,
  };
}

function generateReport(clients: Client[], services: ServiceEntry[], range: string) {
  const programCounts = Array.from(
    clients.reduce((map, c) => {
      const key = c.demographics.program || 'Unassigned';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  );

  const serviceCounts = serviceTypeOptions
    .map((type) => ({
      type,
      count: services.filter((s) => s.serviceType === type).length,
    }))
    .filter((x) => x.count > 0);

  return `Funder Report Draft (${range})

Executive Summary
During this reporting period, the organization supported ${clients.length} active clients and documented ${services.length} service interactions. The platform improved visibility into case activity, reduced manual spreadsheet effort, and standardized client service tracking.

Population Served
The platform currently supports ${new Set(clients.map((c) => c.demographics.program)).size} primary program areas and serves clients with language needs including ${Array.from(new Set(clients.map((c) => c.demographics.language))).join(', ')}.

Program Distribution
${programCounts.map(([program, count]) => `- ${program}: ${count}`).join('\n')}

Services Delivered
${serviceCounts.map((item) => `- ${item.type}: ${item.count}`).join('\n')}

Operational Value
The solution combines configurable case management with AI-generated note structuring, and automated funder reporting. This reduces paper-based work and improves continuity during staff handoffs.

Next Steps
- Expand appointment scheduling
- Add document uploads
- Enable real photo-to-intake OCR
- Support exportable PDF/Word reports`;
}

function normalizeDateToIso(input: string): string {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return '';
}

function parseClientSpeech(rawText: string): Partial<NewClientForm> {
  const text = rawText.replace(/\s+/g, ' ').trim();

  const extract = (pattern: RegExp) => {
    const match = text.match(pattern);
    return match?.[1]?.trim() || '';
  };

  const name = extract(
    /name\s+(.+?)(?=\s+date of birth|\s+dob|\s+phone|\s+email|\s+gender|\s+language|\s+household size|\s+program|\s+status|$)/i
  );
  const dobRaw = extract(
    /(?:date of birth|dob)\s+(.+?)(?=\s+phone|\s+email|\s+gender|\s+language|\s+household size|\s+program|\s+status|$)/i
  );
  const phone = extract(
    /phone\s+(.+?)(?=\s+email|\s+gender|\s+language|\s+household size|\s+program|\s+status|$)/i
  );
  const email = extract(
    /email\s+(.+?)(?=\s+gender|\s+language|\s+household size|\s+program|\s+status|$)/i
  );
  const gender = extract(
    /gender\s+(.+?)(?=\s+language|\s+household size|\s+program|\s+status|$)/i
  );
  const language = extract(
    /language\s+(.+?)(?=\s+household size|\s+program|\s+status|$)/i
  );
  const householdSize = extract(
    /household size\s+(.+?)(?=\s+program|\s+status|$)/i
  );
  const program = extract(/program\s+(.+?)(?=\s+status|$)/i);
  const status = extract(/status\s+(.+?)$/i);

  return {
    name,
    dob: normalizeDateToIso(dobRaw),
    phone,
    email,
    gender,
    language,
    householdSize,
    program,
    status,
  };
}

export default function ClientCaseManagementApp() {
  const [role, setRole] = useState<Role>('Admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [clients, setClients] = useState<Client[]>(seedClients);
  const [services, setServices] = useState<ServiceEntry[]>(seedServices);

  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(seedClients[0].id);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const [newClient, setNewClient] = useState<NewClientForm>({
    name: '',
    dob: '',
    phone: '',
    email: '',
    gender: '',
    language: '',
    householdSize: '',
    program: '',
    status: 'Active',
  });

  const [newService, setNewService] = useState<NewServiceForm>({
    clientId: seedClients[0].id,
    date: '',
    serviceType: '',
    staff: '',
    notes: '',
  });

  
  const [intakeDraft, setIntakeDraft] = useState<null | {
    name: string;
    phone: string;
    email: string;
    program: string;
    language: string;
    confidence: string;
  }>(null);

  const [noteInput, setNoteInput] = useState(
    'Client attended therapy session today and reported feeling stressed. We discussed coping strategies and agreed to follow up next week.'
  );
  const [noteDraft, setNoteDraft] = useState<null | {
    summary: string;
    serviceType: string;
    risk: string;
    followUp: string;
  }>(null);

  const [reportRange, setReportRange] = useState('This Quarter');
  const [reportDraft, setReportDraft] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [isClientRecording, setIsClientRecording] = useState(false);
  const [clientSpeechSupported, setClientSpeechSupported] = useState(true);

  const [fieldConfig, setFieldConfig] = useState<FieldConfig[]>(defaultFieldConfig);
  const [serviceFieldConfig, setServiceFieldConfig] = useState<ServiceFieldConfig[]>(defaultServiceFieldConfig);
  const [isLoggingService, setIsLoggingService] = useState(false);
  const [serviceLogValues, setServiceLogValues] = useState<Record<string, string>>({});
  const [isFieldConfigOpen, setIsFieldConfigOpen] = useState(false);
  const [newFieldDraft, setNewFieldDraft] = useState<{
    label: string;
    type: FieldConfig['type'];
    options: string;
  }>({ label: '', type: 'text', options: '' });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const [profilePanel, setProfilePanel] = useState<ProfilePanel>('details');
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientDraft, setEditClientDraft] = useState<NewClientForm & { customFields: Record<string, string> }>({
    name: '', dob: '', phone: '', email: '',
    gender: '', language: '', householdSize: '', program: '', status: 'Active',
    customFields: {},
  });

  useEffect(() => {
    saveToStorage('clients', clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage('services', services);
  }, [services]);

  useEffect(() => {
    saveToStorage('fieldConfig', fieldConfig);
  }, [fieldConfig]);

  useEffect(() => {
    saveToStorage('serviceFieldConfig', serviceFieldConfig);
  }, [serviceFieldConfig]);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !window.SpeechRecognition &&
      !window.webkitSpeechRecognition
    ) {
      setSpeechSupported(false);
      setClientSpeechSupported(false);
    }
  }, []);
  useEffect(() => {
    setClients(loadFromStorage<Client[]>('clients', seedClients));
    setServices(loadFromStorage<ServiceEntry[]>('services', seedServices));
    setFieldConfig(loadFromStorage<FieldConfig[]>('fieldConfig', defaultFieldConfig));
    setServiceFieldConfig(
      loadFromStorage<ServiceFieldConfig[]>('serviceFieldConfig', defaultServiceFieldConfig)
    );
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.id.toLowerCase().includes(term) ||
        client.demographics.program.toLowerCase().includes(term) ||
        client.demographics.status.toLowerCase().includes(term)
    );
  }, [clients, search]);

  const selectedClient = useMemo(() => {
    return (
      clients.find((c) => c.id === selectedClientId) ||
      filteredClients[0] ||
      clients[0]
    );
  }, [clients, filteredClients, selectedClientId]);

  const selectedClientServices = useMemo(() => {
    return services
      .filter((entry) => entry.clientId === selectedClient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, selectedClient]);

  const totalClients = clients.length;
  const totalServices = services.length;
  const activePrograms = new Set(clients.map((c) => c.demographics.program)).size;
  const activeLanguages = new Set(clients.map((c) => c.demographics.language)).size;

  const startSpeechToText = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      finalTranscript = transcript;
      setNoteInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        setNoteInput(finalTranscript.trim());
      }
    };

    recognition.start();
  };

  const startClientSpeechToText = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setClientSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsClientRecording(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      finalTranscript = transcript;

      const parsed = parseClientSpeech(transcript);
      setNewClient((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        dob: parsed.dob || prev.dob,
        phone: parsed.phone || prev.phone,
        email: parsed.email || prev.email,
        gender: parsed.gender || prev.gender,
        language: parsed.language || prev.language,
        householdSize: parsed.householdSize || prev.householdSize,
        program: parsed.program || prev.program,
        status: parsed.status || prev.status,
      }));
    };

    recognition.onerror = (event) => {
      console.error('Client speech recognition error:', event.error);
      setIsClientRecording(false);
    };

    recognition.onend = () => {
      setIsClientRecording(false);

      if (finalTranscript.trim()) {
        const parsed = parseClientSpeech(finalTranscript.trim());
        setNewClient((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          dob: parsed.dob || prev.dob,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
          gender: parsed.gender || prev.gender,
          language: parsed.language || prev.language,
          householdSize: parsed.householdSize || prev.householdSize,
          program: parsed.program || prev.program,
          status: parsed.status || prev.status,
        }));
      }
    };

    recognition.start();
  };

  const addClient = () => {
    if (!newClient.name || !newClient.dob) return;

    const nextId = `CL-${1000 + clients.length + 1}`;

    const customFields: Record<string, string> = {};
    fieldConfig
      .filter((f) => !f.isBuiltIn && f.enabled)
      .forEach((f) => {
        customFields[f.key] = customFieldValues[f.key] ?? '';
      });

    const created: Client = {
      id: nextId,
      name: newClient.name,
      dob: newClient.dob,
      phone: newClient.phone,
      email: newClient.email,
      demographics: {
        gender: newClient.gender,
        language: newClient.language,
        householdSize: newClient.householdSize,
        program: newClient.program,
        status: newClient.status,
      },
      ...(Object.keys(customFields).length > 0 && { customFields }),
    };

    setClients((prev) => [created, ...prev]);
    setSelectedClientId(nextId);
    setNewClient({
      name: '',
      dob: '',
      phone: '',
      email: '',
      gender: '',
      language: '',
      householdSize: '',
      program: '',
      status: 'Active',
    });
    setCustomFieldValues({});
    setIsClientModalOpen(false);
    setActiveTab('clients');
  };

  const startEditingClient = (client: Client) => {
    setEditClientDraft({
      name: client.name,
      dob: client.dob,
      phone: client.phone,
      email: client.email,
      gender: client.demographics.gender,
      language: client.demographics.language,
      householdSize: client.demographics.householdSize,
      program: client.demographics.program,
      status: client.demographics.status,
      customFields: { ...(client.customFields ?? {}) },
    });
    setIsEditingClient(true);
  };

  const saveClientEdit = () => {
    if (!editClientDraft.name || !editClientDraft.dob) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id !== selectedClientId ? c : {
          ...c,
          name: editClientDraft.name,
          dob: editClientDraft.dob,
          phone: editClientDraft.phone,
          email: editClientDraft.email,
          demographics: {
            gender: editClientDraft.gender,
            language: editClientDraft.language,
            householdSize: editClientDraft.householdSize,
            program: editClientDraft.program,
            status: editClientDraft.status,
          },
          ...(Object.keys(editClientDraft.customFields).length > 0 && {
            customFields: editClientDraft.customFields,
          }),
        }
      )
    );
    setIsEditingClient(false);
  };

  const addService = () => {
    if (!newService.clientId || !newService.date || !newService.serviceType) return;

    const created: ServiceEntry = {
      id: `SV-${services.length + 1}`,
      clientId: newService.clientId,
      date: newService.date,
      serviceType: newService.serviceType,
      staff: newService.staff,
      notes: newService.notes,
    };

    setServices((prev) => [created, ...prev]);
    setSelectedClientId(newService.clientId);
    setNewService({
      clientId: newService.clientId,
      date: '',
      serviceType: '',
      staff: '',
      notes: '',
    });
    setIsServiceModalOpen(false);
    setActiveTab('profile');
  };

  

  const addNoteDraftAsService = () => {
    if (!noteDraft) return;

    const created: ServiceEntry = {
      id: `SV-${services.length + 1}`,
      clientId: selectedClient.id,
      date: new Date().toISOString().slice(0, 10),
      serviceType: noteDraft.serviceType,
      staff: 'AI Assisted Draft',
      notes: `${noteDraft.summary}\n\nRisk Level: ${noteDraft.risk}\nFollow-Up: ${noteDraft.followUp}`,
    };

    setServices((prev) => [created, ...prev]);
    setActiveTab('profile');
  };

  const resetDemoData = () => {
    localStorage.removeItem('clients');
    localStorage.removeItem('services');
    localStorage.removeItem('fieldConfig');
    localStorage.removeItem('serviceFieldConfig');
    setClients(seedClients);
    setServices(seedServices);
    setSelectedClientId(seedClients[0].id);
    setFieldConfig(defaultFieldConfig);
    setServiceFieldConfig(defaultServiceFieldConfig);
    setCustomFieldValues({});
    setServiceLogValues({});
    setIsLoggingService(false);
    setActiveTab('dashboard');
    setIntakeDraft(null);
    setNoteDraft(null);
    setReportDraft('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', color: '#223247' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '290px 1fr',
          minHeight: '100vh',
        }}
      >
        <aside
          style={{
            background: '#ffffff',
            borderRight: '1px solid #e6e8ec',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: '#2563eb',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
              }}
            >
              CF
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>CaseFlow AI</div>
              <div style={{ fontSize: 12, color: '#6b7b88' }}>
                Nonprofit Case Management
              </div>
            </div>
          </div>

          <div style={{ ...shellCard(), padding: 16, marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 700 }}>Signed in role</div>
              <span style={badgeStyle()}>Demo</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setRole('Admin')} style={role === 'Admin' ? primaryButton() : secondaryButton()}>
                Admin
              </button>
              <button onClick={() => setRole('Staff')} style={role === 'Staff' ? primaryButton() : secondaryButton()}>
                Staff
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: '#6b7b88', lineHeight: 1.5 }}>
              {role === 'Admin'
                ? 'Full access to client, service, and AI demo workflows.'
                : 'View records and create drafts for notes, and reporting.'}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {([
              ['dashboard', 'Dashboard'],
              ['clients', 'Clients'],
              ['ai-reporting', 'AI Reporting'],
              ...(role === 'Admin' ? [['form-config', 'Form Configuration']] : []),
            ] as [string, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as ActiveTab)}
                style={
                  activeTab === key
                    ? primaryButton({ textAlign: 'left', width: '100%' })
                    : secondaryButton({ textAlign: 'left', width: '100%' })
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            {(role === 'Admin' || role === 'Staff') && (
              <button onClick={() => setIsClientModalOpen(true)} style={primaryButton()}>
                + New Client
              </button>
            )}
            <button onClick={resetDemoData} style={secondaryButton()}>
              Reset Demo Data
            </button>
          </div>
        </aside>

        <main style={{ padding: 26 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {activeTab === 'dashboard' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h1 style={{ margin: 0, fontSize: 36, color: '#2a3c52' }}>Dashboard</h1>
                  <p style={{ marginTop: 8, color: '#6b7b88' }}>
                    Daily operations view for client activity, service distribution, and follow-up needs.
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {[
                    ['Total Clients', totalClients, 'Across all programs'],
                    ['Service Entries', totalServices, 'Structured case activity'],
                    ['Active Programs', activePrograms, 'Configurable categories'],
                    ['Languages', activeLanguages, 'Support across populations'],
                  ].map(([label, value, desc]) => (
                    <div key={String(label)} style={{ ...shellCard(), padding: 18 }}>
                      <div style={{ fontSize: 13, color: '#6b7b88' }}>{label}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{String(value)}</div>
                      <div style={{ fontSize: 12, color: '#6b7b88', marginTop: 6 }}>{desc}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: 18,
                  }}
                >
                  <div style={{ ...shellCard(), padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 12 }}>Recent Clients</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {clients.slice(0, 5).map((client) => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setIsEditingClient(false);
                            setProfilePanel('details');
                            setActiveTab('profile');
                          }}
                          style={{
                            ...secondaryButton({
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }),
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>{client.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7b88', marginTop: 3 }}>
                              {client.id} • {client.demographics.program}
                            </div>
                          </div>
                          <span style={badgeStyle()}>{client.demographics.status}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...shellCard(), padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 12 }}>Service Distribution</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {serviceTypeOptions
                        .map((type) => ({
                          type,
                          count: services.filter((s) => s.serviceType === type).length,
                        }))
                        .filter((row) => row.count > 0)
                        .map((row) => (
                          <div key={row.type}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 4,
                                fontSize: 14,
                              }}
                            >
                              <span>{row.type}</span>
                              <span>{row.count}</span>
                            </div>
                            <div
                              style={{
                                height: 10,
                                background: '#e6edf0',
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${(row.count / Math.max(services.length, 1)) * 100}%`,
                                  height: '100%',
                                  background: '#9ed0d7',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

              </>
            )}

            {activeTab === 'clients' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h1 style={{ margin: 0, fontSize: 36, color: '#2a3c52' }}>Clients</h1>
                  <p style={{ marginTop: 8, color: '#6b7b88' }}>
                    Search and review all client records across programs.
                  </p>
                </div>

                <div style={{ ...shellCard(), padding: 16, marginBottom: 16 }}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, program, client ID, or status"
                    style={inputStyle()}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                    gap: 16,
                  }}
                >
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setActiveTab('profile');
                      }}
                      style={{
                        ...shellCard({
                          padding: 18,
                          cursor: 'pointer',
                        }),
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{client.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7b88', marginTop: 4 }}>{client.id}</div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 12,
                          marginTop: 16,
                        }}
                      >
                        {(() => {
                          const builtInValueMap: Record<string, string> = {
                            phone: client.phone,
                            email: client.email,
                            gender: client.demographics.gender || '—',
                            language: client.demographics.language,
                            householdSize: client.demographics.householdSize || '—',
                            program: client.demographics.program,
                            status: client.demographics.status,
                          };
                          // Show the 4 summary fields on the card (skip name/dob — shown as header)
                          const cardFieldKeys = ['program', 'status', 'language', 'householdSize'];
                          return fieldConfig
                            .filter((f) => cardFieldKeys.includes(f.key) && (role === 'Admin' || f.enabled))
                            .map((field) => (
                              <div key={field.key}>
                                <div style={{ fontSize: 12, color: '#8fa0ad' }}>{field.label}</div>
                                <div>{builtInValueMap[field.key] ?? '—'}</div>
                              </div>
                            ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'profile' && selectedClient && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '360px 1fr',
                  gap: 18,
                }}
              >
                <div style={{ ...shellCard(), padding: 18, height: 'fit-content' }}>
                  {/* Header row: name + edit/save/cancel controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      {isEditingClient ? (
                        <input
                          value={editClientDraft.name}
                          onChange={(e) => setEditClientDraft((prev) => ({ ...prev, name: e.target.value }))}
                          style={inputStyle({ fontSize: 22, fontWeight: 800, padding: '6px 10px' })}
                        />
                      ) : (
                        <div style={{ fontWeight: 800, fontSize: 24 }}>{selectedClient.name}</div>
                      )}
                      <div style={{ fontSize: 12, color: '#6b7b88', marginTop: 4 }}>{selectedClient.id}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: 2 }}>
                      {isEditingClient ? (
                        <>
                          <button onClick={saveClientEdit} style={primaryButton({ padding: '6px 14px', fontSize: 13 })}>
                            Save
                          </button>
                          <button onClick={() => setIsEditingClient(false)} style={secondaryButton({ padding: '6px 14px', fontSize: 13 })}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditingClient(selectedClient)}
                          style={secondaryButton({ padding: '6px 14px', fontSize: 13 })}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                      marginTop: 18,
                    }}
                  >
                    {(() => {
                      // Map each built-in field key to its raw (editable) value
                      const builtInRawMap: Record<string, string> = {
                        dob: selectedClient.dob,
                        phone: selectedClient.phone,
                        email: selectedClient.email,
                        gender: selectedClient.demographics.gender,
                        language: selectedClient.demographics.language,
                        householdSize: selectedClient.demographics.householdSize,
                        program: selectedClient.demographics.program,
                        status: selectedClient.demographics.status,
                      };
                      // Display-formatted values (read mode)
                      const builtInDisplayMap: Record<string, string> = {
                        ...builtInRawMap,
                        dob: formatDate(selectedClient.dob),
                        gender: selectedClient.demographics.gender || '—',
                        householdSize: selectedClient.demographics.householdSize || '—',
                      };

                      const visibleFields = fieldConfig.filter((f) =>
                        f.key !== 'name' && (role === 'Admin' || f.enabled)
                      );

                      return visibleFields.map((field) => {
                        const displayValue = field.isBuiltIn
                          ? builtInDisplayMap[field.key] ?? '—'
                          : (selectedClient.customFields?.[field.key] ?? '—');

                        // Edit mode: current draft value
                        const draftValue = field.isBuiltIn
                          ? (editClientDraft[field.key as keyof NewClientForm] ?? '')
                          : (editClientDraft.customFields[field.key] ?? '');

                        const handleDraftChange = (val: string) => {
                          if (field.isBuiltIn) {
                            setEditClientDraft((prev) => ({ ...prev, [field.key]: val }));
                          } else {
                            setEditClientDraft((prev) => ({
                              ...prev,
                              customFields: { ...prev.customFields, [field.key]: val },
                            }));
                          }
                        };

                        return (
                          <div key={field.key}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: isEditingClient ? 4 : 0 }}>
                              <div style={{ fontSize: 12, color: '#8fa0ad' }}>{field.label}</div>
                              {role === 'Admin' && !field.enabled && (
                                <span style={{
                                  fontSize: 10,
                                  color: '#2563eb',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: 999,
                                  padding: '1px 6px',
                                  fontWeight: 600,
                                }}>hidden</span>
                              )}
                            </div>
                            {isEditingClient ? (
                              field.type === 'dropdown' ? (
                                <select
                                  value={draftValue}
                                  onChange={(e) => handleDraftChange(e.target.value)}
                                  style={inputStyle({ padding: '7px 10px' })}
                                >
                                  <option value="">Select {field.label}</option>
                                  {(field.options ?? []).map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                  value={draftValue}
                                  onChange={(e) => handleDraftChange(e.target.value)}
                                  style={inputStyle({ padding: '7px 10px' })}
                                />
                              )
                            ) : (
                              <div>{displayValue}</div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                    {(role === 'Admin' || role === 'Staff')&& (
                      <button
                        onClick={() => { setIsLoggingService((p) => !p); setIsEditingClient(false); setProfilePanel('details'); }}
                        style={isLoggingService ? primaryButton({ width: '100%' }) : secondaryButton({ width: '100%' })}
                      >
                        {isLoggingService ? 'Cancel Log' : '+ Log Service'}
                      </button>
                    )}
                    <button
                      onClick={() => { setIsEditingClient(false); setProfilePanel('ai-notes'); }}
                      style={profilePanel === 'ai-notes' ? primaryButton({ width: '100%' }) : secondaryButton({ width: '100%' })}
                    >
                      AI Notes
                    </button>
                   
                  </div>
                </div>

                {profilePanel === 'details' && !isLoggingService && <div style={{ ...shellCard(), padding: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 12 }}>
                    Service &amp; Visit History
                  </div>

                  <div style={{ display: 'grid', gap: 14 }}>
                    {selectedClientServices.length === 0 ? (
                      <div
                        style={{
                          border: '1px dashed #cad5db',
                          borderRadius: 16,
                          padding: 28,
                          textAlign: 'center',
                          color: '#6b7b88',
                        }}
                      >
                        No service records yet.
                      </div>
                    ) : (
                      selectedClientServices.map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            border: '1px solid #e6edf0',
                            borderRadius: 16,
                            padding: 16,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 12,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800 }}>{entry.serviceType}</div>
                              <div style={{ fontSize: 12, color: '#6b7b88', marginTop: 4 }}>
                                {formatDate(entry.date)} • Logged by {entry.staff}
                              </div>
                            </div>
                            <span style={badgeStyle()}>{entry.id}</span>
                          </div>

                          <div
                            style={{
                              marginTop: 12,
                              color: '#46586a',
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.6,
                            }}
                          >
                            {entry.notes}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>}

                {isLoggingService && profilePanel === 'details' && (
                  <div style={{ ...shellCard(), padding: 22 }}>
                    <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Log Service Entry</div>
                    <div style={{ display: 'grid', gap: 14 }}>
                      {serviceFieldConfig
                        .filter((f) => f.enabled)
                        .map((field) => (
                          <div key={field.key}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                              {field.label}
                              {field.required && <span style={{ color: '#b91c1c', marginLeft: 4 }}>*</span>}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                value={serviceLogValues[field.key] ?? ''}
                                onChange={(e) => setServiceLogValues((p) => ({ ...p, [field.key]: e.target.value }))}
                                style={textAreaStyle({ minHeight: 100 })}
                              />
                            ) : (
                              <input
                                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                value={serviceLogValues[field.key] ?? ''}
                                onChange={(e) => setServiceLogValues((p) => ({ ...p, [field.key]: e.target.value }))}
                                style={inputStyle()}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setIsLoggingService(false); setServiceLogValues({}); }} style={secondaryButton()}>
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const date = serviceLogValues['date'] || new Date().toISOString().slice(0, 10);
                          const serviceType = serviceLogValues['serviceType'];
                          if (!serviceType) return;
                          const created: ServiceEntry = {
                            id: `SV-${services.length + 1}`,
                            clientId: selectedClient.id,
                            date,
                            serviceType,
                            staff: serviceLogValues['staff'] ?? '',
                            notes: serviceLogValues['notes'] ?? '',
                          };
                          setServices((prev) => [created, ...prev]);
                          setServiceLogValues({});
                          setIsLoggingService(false);
                        }}
                        style={primaryButton()}
                      >
                        Save Entry
                      </button>
                    </div>
                  </div>
                )}


                {/* AI Notes panel — shown when profilePanel === 'ai-notes' */}
                {profilePanel === 'ai-notes' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 18,
                      gridColumn: '1 / -1',
                    }}
                  >
                    <div style={{ ...shellCard(), padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 28, color: '#2563eb' }}>
                        Automated Case Notes &amp; Summaries
                      </div>
                      <div style={{ color: '#6b7b88', marginTop: 8 }}>
                        Turn a spoken note or free-text case note into a structured summary.
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <span style={badgeStyle({ background: '#eff6ff', color: '#2563eb' })}>
                          Current Client: {selectedClient.name}
                        </span>
                      </div>

                      <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                          Raw note
                        </label>
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          style={textAreaStyle({ minHeight: 220 })}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#6b7b88' }}>
                          Click <strong>Start Recording</strong>, speak your case note, and the text will appear automatically.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                        {speechSupported ? (
                          <button
                            onClick={startSpeechToText}
                            style={secondaryButton({
                              background: isRecording ? '#fee2e2' : '#ffffff',
                              border: isRecording ? '1px solid #dc2626' : '1px solid #cfd8dc',
                              color: isRecording ? '#b91c1c' : '#24364b',
                            })}
                          >
                            {isRecording ? 'Recording...' : '🎤 Start Recording'}
                          </button>
                        ) : (
                          <span style={badgeStyle({ background: '#fff7ed', color: '#9a3412' })}>
                            Speech-to-text not supported in this browser
                          </span>
                        )}

                        <button onClick={() => setNoteDraft(generateNoteSummary(noteInput))} style={primaryButton()}>
                          Generate Structured Note
                        </button>

                        {noteDraft && (
                          <button onClick={addNoteDraftAsService} style={secondaryButton()}>
                            Save as Service Entry
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ ...shellCard(), padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 24 }}>AI Note Output</div>

                      {!noteDraft ? (
                        <div style={{ marginTop: 16, color: '#6b7b88' }}>
                          Run the note generation flow to view the structured summary.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                          <div
                            style={{
                              background: '#fafcfd',
                              border: '1px solid #e6edf0',
                              borderRadius: 14,
                              padding: 14,
                            }}
                          >
                            <div style={{ fontSize: 12, color: '#8fa0ad', marginBottom: 6 }}>Summary</div>
                            <div style={{ color: '#445566', lineHeight: 1.65 }}>{noteDraft.summary}</div>
                          </div>

                          {[
                            ['Detected Service Type', noteDraft.serviceType],
                            ['Risk Level', noteDraft.risk],
                            ['Suggested Follow-Up', noteDraft.followUp],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              style={{
                                background: '#fafcfd',
                                border: '1px solid #e6edf0',
                                borderRadius: 14,
                                padding: 14,
                              }}
                            >
                              <div style={{ fontSize: 12, color: '#8fa0ad', marginBottom: 4 }}>{label}</div>
                              <div style={{ fontWeight: 800 }}>{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'form-config' && (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <h1 style={{ margin: 0, fontSize: 36, color: '#2a3c52' }}>Form Configuration</h1>
                  <p style={{ marginTop: 8, color: '#6b7b88' }}>
                    Customize which fields appear in the New Client form. Required fields are locked.
                  </p>
                </div>

                <div style={{ ...shellCard(), padding: 22 }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 18,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Configured Fields</div>
                    <button
                      onClick={() => setIsFieldConfigOpen((prev) => !prev)}
                      style={primaryButton({ fontSize: 13 })}
                    >
                      {isFieldConfigOpen ? 'Cancel' : '+ Add Field'}
                    </button>
                  </div>

                  {/* Inline Add-Field form */}
                  {isFieldConfigOpen && (
                    <div style={{
                      ...tileCard({ marginBottom: 18, padding: 18 }),
                      display: 'grid',
                      gridTemplateColumns: '1fr 160px 1fr auto auto',
                      gap: 12,
                      alignItems: 'flex-end',
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#6b7b88', marginBottom: 4 }}>
                          Field Label
                        </label>
                        <input
                          value={newFieldDraft.label}
                          onChange={(e) => setNewFieldDraft((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="e.g. Case Worker"
                          style={inputStyle()}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#6b7b88', marginBottom: 4 }}>
                          Type
                        </label>
                        <select
                          value={newFieldDraft.type}
                          onChange={(e) => setNewFieldDraft((prev) => ({ ...prev, type: e.target.value as FieldConfig['type'] }))}
                          style={inputStyle()}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>

                      <div style={{ visibility: newFieldDraft.type === 'dropdown' ? 'visible' : 'hidden' }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#6b7b88', marginBottom: 4 }}>
                          Options (comma-separated)
                        </label>
                        <input
                          value={newFieldDraft.options}
                          onChange={(e) => setNewFieldDraft((prev) => ({ ...prev, options: e.target.value }))}
                          placeholder="Option A, Option B"
                          style={inputStyle()}
                        />
                      </div>

                      <button
                        onClick={() => {
                          const trimmedLabel = newFieldDraft.label.trim();
                          if (!trimmedLabel) return;
                          const key = `custom_${trimmedLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Date.now()}`;
                          const newField: FieldConfig = {
                            key,
                            label: trimmedLabel,
                            type: newFieldDraft.type,
                            required: false,
                            enabled: true,
                            isBuiltIn: false,
                            ...(newFieldDraft.type === 'dropdown' && {
                              options: newFieldDraft.options.split(',').map((s) => s.trim()).filter(Boolean),
                            }),
                          };
                          setFieldConfig((prev) => [...prev, newField]);
                          setNewFieldDraft({ label: '', type: 'text', options: '' });
                          setIsFieldConfigOpen(false);
                        }}
                        style={primaryButton({ whiteSpace: 'nowrap' })}
                      >
                        Save Field
                      </button>

                      <button
                        onClick={() => { setIsFieldConfigOpen(false); setNewFieldDraft({ label: '', type: 'text', options: '' }); }}
                        style={secondaryButton({ whiteSpace: 'nowrap' })}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Field list */}
                  <div style={{ display: 'grid', gap: 8 }}>
                    {fieldConfig.map((field) => (
                      <div
                        key={field.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid #e6edf0',
                          borderRadius: 14,
                          padding: '10px 16px',
                          background: field.enabled ? '#ffffff' : '#f7f9fb',
                          opacity: field.enabled ? 1 : 0.6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{field.label}</span>
                          <span style={badgeStyle({ fontSize: 11, padding: '2px 8px' })}>{field.type}</span>
                          {field.required && (
                            <span style={badgeStyle({ fontSize: 11, padding: '2px 8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' })}>
                              Required
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {field.isBuiltIn && !field.required && (
                            <button
                              onClick={() => setFieldConfig((prev) => prev.map((f) => f.key === field.key ? { ...f, enabled: !f.enabled } : f))}
                              style={secondaryButton({
                                padding: '5px 12px', fontSize: 12,
                                background: field.enabled ? '#edf7f8' : '#ffffff',
                                color: field.enabled ? '#2a7c84' : '#6b7b88',
                                border: field.enabled ? '1px solid #9ed0d7' : '1px solid #cfd8dc',
                              })}
                            >
                              {field.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          )}
                          {!field.isBuiltIn && (
                            <button
                              onClick={() => setFieldConfig((prev) => prev.filter((f) => f.key !== field.key))}
                              style={secondaryButton({ padding: '5px 10px', fontSize: 13, color: '#b91c1c', border: '1px solid #fecaca', background: '#fff5f5' })}
                              title="Remove field"
                            >
                              ×
                            </button>
                          )}
                          {field.required && <span style={{ fontSize: 12, color: '#8fa0ad' }}>Locked</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Log Fields */}
                <div style={{ ...shellCard(), padding: 22, marginTop: 22 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Service Log Fields</div>
                  <div style={{ fontSize: 13, color: '#6b7b88', marginBottom: 16 }}>
                    Configure which fields appear when logging a service entry on a client profile.
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {serviceFieldConfig.map((field) => (
                      <div
                        key={field.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid #e6edf0',
                          borderRadius: 14,
                          padding: '10px 16px',
                          background: field.enabled ? '#ffffff' : '#f7f9fb',
                          opacity: field.enabled ? 1 : 0.6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{field.label}</span>
                          <span style={badgeStyle({ fontSize: 11, padding: '2px 8px' })}>{field.type}</span>
                          {field.required && (
                            <span style={badgeStyle({ fontSize: 11, padding: '2px 8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' })}>
                              Required
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {!field.required && (
                            <button
                              onClick={() => setServiceFieldConfig((prev) => prev.map((f) => f.key === field.key ? { ...f, enabled: !f.enabled } : f))}
                              style={secondaryButton({
                                padding: '5px 12px', fontSize: 12,
                                background: field.enabled ? '#edf7f8' : '#ffffff',
                                color: field.enabled ? '#2a7c84' : '#6b7b88',
                                border: field.enabled ? '1px solid #9ed0d7' : '1px solid #cfd8dc',
                              })}
                            >
                              {field.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          )}
                          {field.required && <span style={{ fontSize: 12, color: '#8fa0ad' }}>Locked</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-reporting' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '340px 1fr',
                  gap: 18,
                }}
              >
                <div style={{ ...shellCard(), padding: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: 28, color: '#2563eb' }}>
                    Automated Reporting
                  </div>
                  <div style={{ color: '#6b7b88', marginTop: 8 }}>
                    Generate a draft narrative report from current client and service data.
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                      Reporting Period
                    </label>
                    <select
                      value={reportRange}
                      onChange={(e) => setReportRange(e.target.value)}
                      style={inputStyle()}
                    >
                      <option>This Month</option>
                      <option>This Quarter</option>
                      <option>Year to Date</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                    <div style={{ ...shellCard(), padding: 14, background: '#fafcfd' }}>
                      <div style={{ fontSize: 12, color: '#8fa0ad' }}>Clients Included</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{clients.length}</div>
                    </div>
                    <div style={{ ...shellCard(), padding: 14, background: '#fafcfd' }}>
                      <div style={{ fontSize: 12, color: '#8fa0ad' }}>Service Entries Included</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{services.length}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setReportDraft(generateReport(clients, services, reportRange))}
                    style={{ ...primaryButton(), marginTop: 16 }}
                  >
                    Generate Draft Report
                  </button>
                </div>

                <div style={{ ...shellCard(), padding: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: 24 }}>Generated Report Draft</div>

                  {!reportDraft ? (
                    <div style={{ marginTop: 16, color: '#6b7b88' }}>
                      Generate a report to view the narrative output.
                    </div>
                  ) : (
                    <pre
                      style={{
                        marginTop: 16,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        lineHeight: 1.7,
                        color: '#445566',
                        background: '#fafcfd',
                        border: '1px solid #e6edf0',
                        borderRadius: 14,
                        padding: 16,
                      }}
                    >
                      {reportDraft}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div style={modalOverlayStyle(isClientModalOpen)}>
        <div style={{ ...shellCard(), width: '100%', maxWidth: 760, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 14 }}>Create New Client</div>

          <div style={{ marginBottom: 14 }}>
            {clientSpeechSupported ? (
              <button
                onClick={startClientSpeechToText}
                style={secondaryButton({
                  background: isClientRecording ? '#fee2e2' : '#ffffff',
                  border: isClientRecording ? '1px solid #dc2626' : '1px solid #cfd8dc',
                  color: isClientRecording ? '#b91c1c' : '#24364b',
                })}
              >
                {isClientRecording ? 'Recording Client Details...' : '🎤 Voice Fill New Client'}
              </button>
            ) : (
              <span style={badgeStyle({ background: '#fff7ed', color: '#9a3412' })}>
                Speech-to-text not supported in this browser
              </span>
            )}

            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7b88', lineHeight: 1.5 }}>
              Say something like: <strong>Name Maria Lopez, date of birth 1987-05-14, phone 555 203 9912, email maria@example.org, language Spanish, program Food Assistance, status Active</strong>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            {(() => {
              const enabledFields = fieldConfig.filter((f) => f.enabled);
              return enabledFields.map((field, idx) => {
                const isBuiltIn = field.isBuiltIn;
                const builtInKey = field.key as keyof NewClientForm;
                const value = isBuiltIn
                  ? newClient[builtInKey]
                  : (customFieldValues[field.key] ?? '');
                const handleChange = (val: string) => {
                  if (isBuiltIn) {
                    setNewClient((prev) => ({ ...prev, [builtInKey]: val }));
                  } else {
                    setCustomFieldValues((prev) => ({ ...prev, [field.key]: val }));
                  }
                };
                const isLastAndOdd = idx === enabledFields.length - 1 && enabledFields.length % 2 !== 0;

                return (
                  <div
                    key={field.key}
                    style={isLastAndOdd ? { gridColumn: '1 / span 2' } : {}}
                  >
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                      {field.label}
                      {field.required && <span style={{ color: '#b91c1c', marginLeft: 4 }}>*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        style={inputStyle()}
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        style={inputStyle()}
                      />
                    )}

                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        style={inputStyle()}
                      />
                    )}

                    {field.type === 'dropdown' && (
                      <select
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        style={inputStyle()}
                      >
                        <option value="">Select {field.label}</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button onClick={() => setIsClientModalOpen(false)} style={secondaryButton()}>
              Cancel
            </button>
            <button onClick={addClient} style={primaryButton()}>
              Save Client
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}