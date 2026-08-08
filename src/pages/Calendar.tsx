import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, CheckSquare,
  TrendingUp, Users,
} from 'lucide-react';
import { useAppointments, useTasks, useDeals, useAttendance, useLeads, useProperties, useTeamMembers } from '@/hooks/useData';
import { Modal } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import {
  APPT_TYPE_LABELS, APPT_STATUS_STYLES, APPT_STATUS_LABELS,
  TASK_PRIORITY_STYLES, TASK_PRIORITY_LABELS,
  DEAL_STAGE_LABELS, DEAL_STAGE_COLORS,
  ATTENDANCE_STATUS_STYLES, ATTENDANCE_STATUS_LABELS,
  formatTime,
} from '@/lib/constants';
import type {
  Appointment, Task, Deal, Attendance as AttendanceRecord,
  Lead, Property, Profile,
} from '@/types';

type CalendarEventKind = 'appointment' | 'task' | 'deal' | 'attendance';

interface CalendarEvent {
  id: string;
  kind: CalendarEventKind;
  title: string;
  date: string;
  time: string | null;
  meta?: Record<string, string>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EVENT_CONFIG: Record<CalendarEventKind, { color: string; dot: string; icon: typeof Clock; label: string }> = {
  appointment: { color: 'bg-blue-500', dot: 'bg-blue-500', icon: Clock, label: 'Appointment' },
  task: { color: 'bg-amber-500', dot: 'bg-amber-500', icon: CheckSquare, label: 'Task' },
  deal: { color: 'bg-emerald-500', dot: 'bg-emerald-500', icon: TrendingUp, label: 'Deal close' },
  attendance: { color: 'bg-violet-500', dot: 'bg-violet-500', icon: Users, label: 'Attendance' },
};

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CalendarPage() {
  const { appointments, loading: apptLoading } = useAppointments();
  const { tasks, loading: taskLoading } = useTasks();
  const { deals, loading: dealLoading } = useDeals();
  const { records: attendance, loading: attLoading } = useAttendance();
  const { leads } = useLeads();
  const { properties } = useProperties();
  const { members } = useTeamMembers();

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateString(new Date()));
  const [filters, setFilters] = useState<Record<CalendarEventKind, boolean>>({
    appointment: true, task: true, deal: true, attendance: true,
  });

  const loading = apptLoading || taskLoading || dealLoading || attLoading;

  function getLead(id: string | null): Lead | undefined {
    return id ? leads.find((l) => l.id === id) : undefined;
  }
  function getProperty(id: string | null): Property | undefined {
    return id ? properties.find((p) => p.id === id) : undefined;
  }
  function getMember(id: string | null): Profile | undefined {
    return id ? members.find((m) => m.user_id === id) : undefined;
  }

  const events = useMemo<CalendarEvent[]>(() => {
    const evts: CalendarEvent[] = [];

    appointments.forEach((a) => {
      const d = new Date(a.start_at);
      evts.push({
        id: a.id,
        kind: 'appointment',
        title: a.title,
        date: toDateString(d),
        time: formatTime(a.start_at),
        meta: {
          type: APPT_TYPE_LABELS[a.type],
          status: APPT_STATUS_LABELS[a.status],
          lead: getLead(a.lead_id)?.full_name ?? '',
          property: getProperty(a.property_id)?.title ?? '',
          assignee: getMember(a.assigned_to)?.full_name ?? '',
        },
      });
    });

    tasks.forEach((t) => {
      if (!t.due_at) return;
      const d = new Date(t.due_at);
      evts.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        date: toDateString(d),
        time: formatTime(t.due_at),
        meta: {
          priority: TASK_PRIORITY_LABELS[t.priority],
          status: t.status,
          lead: getLead(t.lead_id)?.full_name ?? '',
          assignee: getMember(t.assigned_to)?.full_name ?? '',
        },
      });
    });

    deals.forEach((d) => {
      if (!d.close_date) return;
      const date = new Date(d.close_date);
      evts.push({
        id: d.id,
        kind: 'deal',
        title: `Deal: ${getLead(d.lead_id)?.full_name ?? 'Unknown'}`,
        date: toDateString(date),
        time: null,
        meta: {
          stage: DEAL_STAGE_LABELS[d.stage],
          value: d.currency === 'INR'
            ? '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(d.value)
            : String(d.value),
          property: getProperty(d.property_id)?.title ?? '',
        },
      });
    });

    attendance.forEach((r) => {
      evts.push({
        id: r.id,
        kind: 'attendance',
        title: getMember(r.user_id)?.full_name ?? 'Unknown',
        date: r.date,
        time: formatTime(r.check_in_at),
        meta: {
          status: ATTENDANCE_STATUS_LABELS[r.status],
          checkIn: formatTime(r.check_in_at),
          checkOut: r.check_out_at ? formatTime(r.check_out_at) : '—',
        },
      });
    });

    return evts;
  }, [appointments, tasks, deals, attendance, leads, properties, members]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      if (!filters[e.kind]) return;
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    list: for (const [, list] of map) {
      list.sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });
    }
    return map;
  }, [events, filters]);

  const calendarDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const todayStr = toDateString(new Date());

  const monthStats = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const inMonth = events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && filters[e.kind];
    });
    return {
      total: inMonth.length,
      appointments: inMonth.filter((e) => e.kind === 'appointment').length,
      tasks: inMonth.filter((e) => e.kind === 'task').length,
      deals: inMonth.filter((e) => e.kind === 'deal').length,
      attendance: inMonth.filter((e) => e.kind === 'attendance').length,
    };
  }, [events, cursor, filters]);

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  function prevMonth() { setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)); }
  function nextMonth() { setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)); }
  function goToday() {
    const n = new Date();
    setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelectedDate(toDateString(n));
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 min-w-[180px] text-center">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors">
            Today
          </button>
        </div>

        {/* Filter toggles */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EVENT_CONFIG) as CalendarEventKind[]).map((kind) => {
            const cfg = EVENT_CONFIG[kind];
            const active = filters[kind];
            return (
              <button
                key={kind}
                onClick={() => setFilters({ ...filters, [kind]: !active })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  active
                    ? 'bg-white text-slate-700 border-slate-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot} ${active ? '' : 'opacity-30'}`} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-0.5"><CalendarDays className="w-4 h-4" /> Total events</div>
          <div className="text-xl font-bold text-slate-900">{monthStats.total}</div>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 text-blue-500 text-xs mb-0.5"><Clock className="w-4 h-4" /> Appointments</div>
          <div className="text-xl font-bold text-blue-600">{monthStats.appointments}</div>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 text-amber-500 text-xs mb-0.5"><CheckSquare className="w-4 h-4" /> Tasks due</div>
          <div className="text-xl font-bold text-amber-600">{monthStats.tasks}</div>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 text-emerald-500 text-xs mb-0.5"><TrendingUp className="w-4 h-4" /> Deal closes</div>
          <div className="text-xl font-bold text-emerald-600">{monthStats.deals}</div>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 text-violet-500 text-xs mb-0.5"><Users className="w-4 h-4" /> Attendance</div>
          <div className="text-xl font-bold text-violet-600">{monthStats.attendance}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} className="min-h-[88px] sm:min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50" />;
              const ds = toDateString(date);
              const dayEvents = eventsByDate.get(ds) ?? [];
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDate;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(ds)}
                  className={`min-h-[88px] sm:min-h-[100px] border-b border-r border-slate-100 p-1.5 text-left align-top flex flex-col gap-1 transition-colors ${
                    isSelected ? 'ring-2 ring-inset ring-slate-900 bg-slate-50' : 'hover:bg-slate-50'
                  } ${isWeekend ? 'bg-slate-50/30' : ''}`}
                >
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}>
                    {date.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((e) => {
                      const cfg = EVENT_CONFIG[e.kind];
                      return (
                        <span key={e.id} className={`text-[10px] leading-tight px-1.5 py-0.5 rounded text-white truncate ${cfg.color}`}>
                          {e.time && `${e.time} `}{e.title}
                        </span>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium px-1">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="card p-5 max-h-[600px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-900">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a day'}
            </h3>
            {selectedEvents.length > 0 && (
              <span className="badge bg-slate-100 text-slate-500 ml-auto">{selectedEvents.length}</span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
          ) : selectedEvents.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No events on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((e) => (
                <DayEventCard key={`${e.kind}-${e.id}`} event={e} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DayEventCard({ event }: { event: CalendarEvent }) {
  const cfg = EVENT_CONFIG[event.kind];
  const Icon = cfg.icon;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-slate-900 truncate">{event.title}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
            {event.time && <span>· {event.time}</span>}
          </div>
        </div>
      </button>

      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          title={event.title}
          size="sm"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`badge ${cfg.color} text-white`}>{cfg.label}</span>
              {event.time && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> {event.time}
                </span>
              )}
            </div>
            {event.meta && Object.entries(event.meta).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-400 capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm text-slate-700 font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
