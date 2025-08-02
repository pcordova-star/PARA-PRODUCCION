'use client';

import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState, useMemo } from 'react';
import type { Contract, UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Set moment to Spanish for calendar messages
import 'moment/locale/es';
moment.locale('es');

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    type: 'payment' | 'contract' | 'adjustment' | 'common_expenses' | 'utilities';
    status?: 'completed' | 'pending';
    contractId: string;
    propertyId: string;
    propertyName: string;
  };
}

const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = '#3174ad'; // Default color

  switch (event.resource.type) {
    case 'payment':
      backgroundColor = event.resource.status === 'completed' ? '#5cb85c' : '#f0ad4e';
      break;
    case 'contract':
      backgroundColor = '#d9534f';
      break;
    case 'adjustment':
      backgroundColor = '#5bc0de';
      break;
    case 'common_expenses':
      backgroundColor = '#6c757d'; 
      break;
    case 'utilities':
      backgroundColor = '#007bff';
      break;
    default:
      backgroundColor = '#3174ad';
  }

  const style = {
    backgroundColor,
    borderRadius: '5px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block',
  };
  return {
    style: style,
  };
};


// MOCK DATA
const mockContracts: Contract[] = [
    {
        id: 'CTR-001',
        propertyId: '1',
        propertyAddress: 'Av. Providencia 123',
        propertyName: 'Depto. Providencia',
        landlordId: 'user_landlord_123',
        landlordName: 'Carlos R.',
        tenantId: 'user_tenant_456',
        tenantName: 'Juan Pérez',
        startDate: '2023-08-15T00:00:00Z',
        endDate: '2024-08-14T00:00:00Z',
        rentAmount: 500000,
        status: 'Activo',
        propertyUsage: 'Habitacional',
        tenantEmail: 'juan.perez@email.com',
        tenantRut: '11.111.111-1',
        rentPaymentDay: 5,
        commonExpensesIncluded: 'no incluidos',
        commonExpensesPaymentDay: 15,
    },
    {
        id: 'CTR-002',
        propertyId: '2',
        propertyAddress: 'Calle Falsa 123',
        propertyName: 'Casa Las Condes',
        landlordId: 'user_landlord_123',
        landlordName: 'Carlos R.',
        tenantId: 'user_tenant_789',
        tenantName: 'Ana García',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2025-12-31T00:00:00Z',
        rentAmount: 1200000,
        status: 'Activo',
        propertyUsage: 'Habitacional',
        tenantEmail: 'ana.garcia@email.com',
        tenantRut: '22.222.222-2',
        rentPaymentDay: 1,
        utilitiesPaymentDay: 25,
    },
];
const mockUser: UserProfile = { uid: 'user_landlord_123', role: 'Arrendador', name: 'Carlos R.', email: 'carlos.r@email.com' };

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  useEffect(() => {
    const fetchCalendarData = () => {
      setLoading(true);
      
      const contracts = mockContracts;
      const generatedEvents: CalendarEvent[] = [];
      const today = moment();

      contracts.forEach(contract => {
        if (!contract.startDate || !contract.endDate) return;

        const contractStartMoment = moment(contract.startDate);
        const contractEndMoment = moment(contract.endDate);

        let loopStart = moment.max(contractStartMoment, today.clone().subtract(6, 'months'));
        let loopEnd = moment.min(contractEndMoment, today.clone().add(12, 'months'));

        if (loopStart.isAfter(loopEnd)) return;

        let currentMonth = loopStart.clone().startOf('month');

        while (currentMonth.isSameOrBefore(loopEnd)) {
          if (currentMonth.isSame(contractEndMoment, 'month') && currentMonth.isSameOrBefore(contractEndMoment)) {
            generatedEvents.push({
              title: `Fin Contrato: ${contract.propertyName}`,
              start: contractEndMoment.toDate(),
              end: contractEndMoment.toDate(),
              allDay: true,
              resource: { type: 'contract', contractId: contract.id, propertyId: contract.propertyId, propertyName: contract.propertyName },
            });
          }

          const rentPaymentDay = contract.rentPaymentDay || 5;
          const rentDate = currentMonth.clone().date(rentPaymentDay);
          if (rentDate.isSameOrAfter(contractStartMoment) && rentDate.isSameOrBefore(contractEndMoment)) {
            generatedEvents.push({
              title: `Pago Arriendo: ${contract.propertyName}`,
              start: rentDate.toDate(),
              end: rentDate.toDate(),
              allDay: true,
              resource: { type: 'payment', status: 'pending', contractId: contract.id, propertyId: contract.propertyId, propertyName: contract.propertyName },
            });
          }

          if (contract.commonExpensesIncluded === 'no incluidos' && contract.commonExpensesPaymentDay) {
            const commonExpensesDate = currentMonth.clone().date(contract.commonExpensesPaymentDay);
            if (commonExpensesDate.isSameOrAfter(contractStartMoment) && commonExpensesDate.isSameOrBefore(contractEndMoment)) {
              generatedEvents.push({
                title: `Pago G. Comunes: ${contract.propertyName}`,
                start: commonExpensesDate.toDate(),
                end: commonExpensesDate.toDate(),
                allDay: true,
                resource: { type: 'common_expenses', status: 'pending', contractId: contract.id, propertyId: contract.propertyId, propertyName: contract.propertyName },
              });
            }
          }

          if (contract.utilitiesPaymentDay) {
            const utilitiesDate = currentMonth.clone().date(contract.utilitiesPaymentDay);
            if (utilitiesDate.isSameOrAfter(contractStartMoment) && utilitiesDate.isSameOrBefore(contractEndMoment)) {
              generatedEvents.push({
                title: `Pago Cuentas: ${contract.propertyName}`,
                start: utilitiesDate.toDate(),
                end: utilitiesDate.toDate(),
                allDay: true,
                resource: { type: 'utilities', status: 'pending', contractId: contract.id, propertyId: contract.propertyId, propertyName: contract.propertyName },
              });
            }
          }

          currentMonth.add(1, 'month');
        }
      });
      
      setEvents(generatedEvents);
      setLoading(false);
    };

    fetchCalendarData();
  }, []);
  
  const calendarMessages = useMemo(() => ({
      next: "Siguiente",
      previous: "Anterior",
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
      agenda: "Agenda",
      date: "Fecha",
      time: "Hora",
      event: "Evento",
      showMore: (total: number) => `+${total} más`,
  }), []);


  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendario de Eventos</h1>
        <div style={{ height: 700, width: '100%' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                date={currentDate}
                onNavigate={setCurrentDate}
                view={currentView}
                onView={setCurrentView}
                messages={calendarMessages}
            />
        </div>
    </div>
  );
}
