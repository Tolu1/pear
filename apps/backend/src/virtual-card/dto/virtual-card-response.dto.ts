import { VirtualCard } from '../interfaces/virtual-card.interface';

export class VirtualCardResponseDto implements VirtualCard {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}
