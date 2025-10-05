import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface TouristAddOn {
  id: string;
  label: string;
  price?: number | string;
}

export interface TouristBookingSelection {
  name: string;
  location: string;
  type?: string;
  counts: {
    adults: number;
    children: number;
    vehicles: number;
    cameras: number;
  };
  addOns: string[]; // ids of selected addons
}

@Component({
  selector: 'app-tourist-spot-selection',
  templateUrl: './tourist-spot-selection.component.html',
  styleUrls: ['./tourist-spot-selection.component.scss'],
})
export class TouristSpotSelectionComponent {
  @Input() category?: string;
  @Input() name = '';
  @Input() location = '';
  @Input() type?: string;
  @Input() images: string[] = [];

  // Quick info
  @Input() entryFee?: string | number;
  @Input() parkingFee?: string | number;
  @Input() cameraFee?: string | number;
  @Input() fees?: { entryPerPerson?: number; parkingPerVehicle?: number; cameraPerCamera?: number; parkingTwoWheeler?: number; parkingFourWheeler?: number };

  // Add-ons
  @Input() addOns: TouristAddOn[] = [];

  // Routing for details
  @Input() detailsLink: any[] | string = ['/tourist-destination'];
  @Input() detailsFragment?: string;

  @Output() addToBooking = new EventEmitter<TouristBookingSelection>();

  // Form state
  adults = 1;
  children = 0;
  vehicles = 0;
  cameras = 0;
  selectedAddOnIds = new Set<string>();

  private toNumber(val: unknown): number | undefined {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? undefined : n;
    }
    return undefined;
  }

  get unitEntry(): number | undefined {
    return this.fees?.entryPerPerson ?? this.toNumber(this.entryFee);
  }
  get unitParking(): number | undefined {
    return this.fees?.parkingPerVehicle ?? this.toNumber(this.parkingFee);
  }
  get parkingTwoWheeler(): number | undefined {
    return this.fees?.parkingTwoWheeler;
  }
  get parkingFourWheeler(): number | undefined {
    return this.fees?.parkingFourWheeler;
  }
  get unitCamera(): number | undefined {
    return this.fees?.cameraPerCamera ?? this.toNumber(this.cameraFee);
  }

  // Note: children input is hidden in the UI; keep children property for compatibility but
  // count only adults as 'people' for booking and estimation.
  get peopleCount(): number { return (this.adults || 0); }
  get addOnsTotal(): number {
    let total = 0;
    this.addOns.forEach(a => {
      if (this.selectedAddOnIds.has(a.id) && typeof a.price === 'number') total += a.price;
    });
    return total;
  }
  get estimatedTotal(): number | undefined {
    const e = this.unitEntry, p = this.unitParking, c = this.unitCamera;
    if (e === undefined && p === undefined && c === undefined && this.addOnsTotal === 0) return undefined;
    const base = (e || 0) * this.peopleCount + (p || 0) * (this.vehicles || 0) + (c || 0) * (this.cameras || 0);
    return base + this.addOnsTotal;
  }

  inc(field: 'adults'|'children'|'vehicles'|'cameras') { (this as any)[field] = ((this as any)[field] || 0) + 1; }
  dec(field: 'adults'|'children'|'vehicles'|'cameras') {
    const next = Math.max(0, ((this as any)[field] || 0) - 1);
    if (field === 'adults') {
      (this as any)[field] = Math.max(1, next); // keep at least 1 adult
    } else {
      (this as any)[field] = next;
    }
  }

  toggleAddOn(id: string, checked: boolean) {
    if (checked) this.selectedAddOnIds.add(id);
    else this.selectedAddOnIds.delete(id);
  }

  onAddToBooking() {
    if (this.peopleCount <= 0) {
      // Guard: require at least one person
      return;
    }
    const payload: TouristBookingSelection = {
      name: this.name,
      location: this.location,
      type: this.type,
      counts: {
        adults: this.adults || 0,
        children: this.children || 0,
        vehicles: this.vehicles || 0,
        cameras: this.cameras || 0,
      },
      addOns: Array.from(this.selectedAddOnIds),
    };
    this.addToBooking.emit(payload);
  }
}
