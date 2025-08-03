
'use client';

import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Contract } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


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

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchCalendarData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const userField = currentUser.role === 'Arrendador' ? 'landlordId' : 'tenantId';
      const contractsQuery = query(collection(db, 'contracts'), where(userField, '==', currentUser.uid));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contracts = contractsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contract));

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
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      toast({
        title: "Error al cargar el calendario",
        description: "No se pudieron obtener los datos de los contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);
  
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

    