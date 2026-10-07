import { type ChangeEvent, type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock3,
  CircleAlert,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Room = {
  id: string;
  name: string;
  building: string;
  capacity: number;
  features: string[];
};

type Reservation = {
  id: string;
  roomId: string;
  date: string;
  start: string;
  end: string;
  createdAt: string;
};

const ROOMS: Room[] = [
  { id: 'aula-204', name: 'Aula 204', building: 'Edificio de Humanidades', capacity: 24, features: ['Proyector', 'Pizarra'] },
  { id: 'sala-estudio-3', name: 'Sala de estudio 3', building: 'Biblioteca Central · Planta 2', capacity: 8, features: ['Pantalla', 'Wi-Fi'] },
  { id: 'seminario-1', name: 'Seminario 1', building: 'Facultad de Ciencias', capacity: 16, features: ['Proyector', 'Videoconferencia'] },
  { id: 'aula-colaborativa', name: 'Aula colaborativa', building: 'Centro de Aprendizaje · Planta 1', capacity: 12, features: ['Pantalla', 'Pizarra'] },
];

const STORAGE_KEY = 'reservasalas-reservations-v1';

function todayLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function loadReservations(): Reservation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Reservation =>
      item && typeof item.id === 'string' && typeof item.roomId === 'string' &&
      typeof item.date === 'string' && typeof item.start === 'string' && typeof item.end === 'string'
    );
  } catch {
    return [];
  }
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

function formatDate(date: string) {
  if (!date) return 'Fecha sin seleccionar';
  return new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${date}T12:00:00`));
}

function Home() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [date, setDate] = useState(todayLocal());
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('11:00');
  const [reservations, setReservations] = useState<Reservation[]>(loadReservations);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);

  const selectedRoom = ROOMS.find((room) => room.id === roomId) ?? ROOMS[0];
  const dayReservations = useMemo(
    () => reservations.filter((reservation) => reservation.date === date),
    [reservations, date],
  );
  const conflictingRooms = useMemo(() => new Set(
    reservations
      .filter((reservation) =>
        reservation.date === date && overlaps(start, end, reservation.start, reservation.end)
      )
      .map((reservation) => reservation.roomId),
  ), [reservations, date, start, end]);

  const resetFeedback = () => {
    setFeedback(null);
    setConfirmation(null);
  };

  const validate = () => {
    if (!roomId || !date || !start || !end) {
      setFeedback({ kind: 'error', text: 'Completa todos los campos para continuar.' });
      return false;
    }
    if (date < todayLocal()) {
      setFeedback({ kind: 'error', text: 'Selecciona una fecha de hoy en adelante.' });
      return false;
    }
    if (end <= start) {
      setFeedback({ kind: 'error', text: 'La hora de fin debe ser posterior a la hora de inicio.' });
      return false;
    }
    return true;
  };

  const handleConsult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmation(null);
    if (!validate()) return;
    if (conflictingRooms.has(roomId)) {
      setFeedback({ kind: 'error', text: `${selectedRoom.name} ya tiene una reserva que coincide con ese horario. Prueba otra sala u otra franja.` });
      return;
    }
    setFeedback({ kind: 'success', text: `${selectedRoom.name} está disponible para el horario seleccionado.` });
  };

  const handleReserve = () => {
    setConfirmation(null);
    if (!validate()) return;
    if (conflictingRooms.has(roomId)) {
      setFeedback({ kind: 'error', text: 'Este horario ya no está disponible para esa sala. Elige otra franja antes de reservar.' });
      return;
    }
    const reservation: Reservation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roomId,
      date,
      start,
      end,
      createdAt: new Date().toISOString(),
    };
    const updated = [...reservations, reservation];
    setReservations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // La reserva permanece activa en esta sesión aunque el navegador impida guardar localmente.
    }
    setConfirmation(reservation);
    setFeedback(null);
  };

  const onFieldChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(event.target.value);
    resetFeedback();
  };

  const reservationsForDay = dayReservations
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ReservaSalas, inicio">
          <span className="brand-mark"><Building2 size={21} strokeWidth={1.8} /></span>
          <span><span className="brand-name">ReservaSalas</span><span className="brand-subtitle">Servicios universitarios</span></span>
        </a>
        <div className="top-context"><span className="campus-dot" aria-hidden="true" /> <span>Espacios del campus</span></div>
      </header>

      <main className="main">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Reserva de espacios</p>
            <h1 className="serif" id="page-title">Un espacio para<br />hacerlo posible.</h1>
            <p className="intro-copy">Encuentra una sala que se adapte a tu próxima sesión de estudio, tutoría o trabajo en equipo. Consulta disponibilidad y reserva en unos pocos pasos.</p>
          </div>
          <aside className="intro-aside"><strong>Simple y directo</strong>Reserva de salas para la comunidad universitaria, sin trámites adicionales.</aside>
        </section>

        <div className="workspace">
          <section className="panel booking-panel" aria-labelledby="booking-title">
            <div className="panel-heading">
              <div><h2 id="booking-title">Planifica tu reserva</h2><p>Elige la sala y el horario que necesitas.</p></div>
              <span className="step-badge"><CalendarCheck size={14} /> Reserva en 2 pasos</span>
            </div>
            <form onSubmit={handleConsult} noValidate>
              <div className="field-grid">
                <div className="field field-wide">
                  <label htmlFor="room">Sala</label>
                  <div className="input-wrap"><Building2 size={17} /><select id="room" className="with-icon" value={roomId} onChange={onFieldChange(setRoomId)} required data-testid="select-room">
                    {ROOMS.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.building}</option>)}
                  </select></div>
                  <span className="field-hint" data-testid="text-room-details">{selectedRoom.capacity} plazas · {selectedRoom.features.join(' · ')}</span>
                </div>
                <div className="field field-wide">
                  <label htmlFor="date">Fecha</label>
                  <div className="input-wrap"><CalendarDays size={17} /><input id="date" className="with-icon" type="date" min={todayLocal()} value={date} onChange={onFieldChange(setDate)} required data-testid="input-date" /></div>
                </div>
                <div className="field">
                  <label htmlFor="start">Hora de inicio</label>
                  <div className="input-wrap"><Clock3 size={17} /><input id="start" className="with-icon" type="time" value={start} onChange={onFieldChange(setStart)} required data-testid="input-start-time" /></div>
                </div>
                <div className="field">
                  <label htmlFor="end">Hora de fin</label>
                  <div className="input-wrap"><Clock3 size={17} /><input id="end" className="with-icon" type="time" value={end} onChange={onFieldChange(setEnd)} required data-testid="input-end-time" /></div>
                </div>
              </div>
              <div className="form-actions">
                <button className="button button-secondary" type="submit" data-testid="button-check-availability"><Search size={16} /> Consultar disponibilidad</button>
                <button className="button button-primary" type="button" onClick={handleReserve} data-testid="button-reserve-room"><CalendarCheck size={16} /> Reservar sala</button>
              </div>
              {feedback && <div className={`form-message ${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'} aria-live="polite" data-testid={`status-${feedback.kind}`}>
                {feedback.kind === 'success' ? <Check size={17} /> : <CircleAlert size={17} />}
                <span>{feedback.text}</span>
              </div>}
              {confirmation && <div className="form-message success" role="status" aria-live="polite" data-testid="reservation-confirmation">
                <ShieldCheck size={18} />
                <span><strong>Reserva confirmada.</strong> {selectedRoom.name}, {formatDate(confirmation.date)} de {confirmation.start} a {confirmation.end}. La reserva queda guardada en este dispositivo.</span>
              </div>}
            </form>
          </section>

          <aside className="side-column">
            <section className="panel availability-panel" aria-labelledby="availability-title">
              <div className="side-heading"><h2 id="availability-title">Disponibilidad</h2><span className="live-label">Actualizada</span></div>
              <p className="availability-context" data-testid="text-availability-context">{date ? `${formatDate(date)} · ${start}–${end}` : 'Selecciona fecha y horario'}</p>
              <ul className="room-list" aria-live="polite" data-testid="list-room-availability">
                {ROOMS.map((room) => {
                  const occupied = conflictingRooms.has(room.id);
                  return <li className="room-item" key={room.id} data-testid={`room-availability-${room.id}`}>
                    <div className="room-info"><p className="room-name">{room.name}</p><p className="room-meta">{room.building} · {room.capacity} plazas</p></div>
                    <span className={`room-status ${occupied ? 'occupied' : 'available'} ${room.id === roomId ? 'selected' : ''}`} data-testid={`status-room-${room.id}`}>{occupied ? 'Ocupada' : 'Disponible'}</span>
                  </li>;
                })}
              </ul>
            </section>

            <section className="panel activity-panel" aria-labelledby="activity-title">
              <div className="side-heading"><h2 id="activity-title">Reservas del día</h2><span className="live-label">{reservationsForDay.length} {reservationsForDay.length === 1 ? 'reserva' : 'reservas'}</span></div>
              {reservationsForDay.length === 0
                ? <p className="activity-empty" data-testid="empty-day-reservations">Aún no hay reservas para {formatDate(date)}. Este horario está listo para planificar.</p>
                : <div className="reservation-list" data-testid="list-day-reservations">
                  {reservationsForDay.map((reservation) => {
                    const room = ROOMS.find((item) => item.id === reservation.roomId);
                    return <div className="reservation-row" key={reservation.id} data-testid={`reservation-row-${reservation.id}`}>
                      <strong>{room?.name ?? 'Sala universitaria'}</strong>
                      <span>{reservation.start}–{reservation.end} · {room?.building}</span>
                    </div>;
                  })}
                </div>}
            </section>
          </aside>
        </div>

        <footer className="footer-note">
          <span><ShieldCheck size={14} /> Tus reservas se guardan de forma local en este dispositivo.</span>
          <span><BookOpen size={14} /> Espacios para estudiar, colaborar y compartir.</span>
        </footer>
      </main>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
