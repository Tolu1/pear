import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, map } from 'rxjs';
import { filter } from 'rxjs/operators';
import { type PaymentStatus } from 'src/database/database.types';

interface PaymentEvent {
  data: {
    paymentId: string;
    status: PaymentStatus;
  };
}

@Injectable()
export class PaymentsEventsService {
  private eventSubject = new Subject<PaymentEvent>();

  sendEvent(event: PaymentEvent): void {
    this.eventSubject.next(event);
  }

  subscribeToPaymentEvents(paymentId: string): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter((event) => event.data.paymentId === paymentId),
      map((event) => ({ data: event.data.status }) as MessageEvent),
    );
  }
}
