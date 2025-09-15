import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TouristBookingSelection } from '../../shared/tourist-spot-selection/tourist-spot-selection.component';

export interface BookedTouristSpot {
  id: string;
  name: string;
  location: string;
  type?: string;
  counts: {
    adults: number;
    children: number;
    vehicles: number;
    cameras: number;
  };
  unitPrices: {
    entry: number;
    parking: number;
    camera: number;
  };
  breakdown: {
    entry: number;
    parking: number;
    camera: number;
    addOns: number;
  };
  total: number;
  peopleCount: number;
  addOns: string[];
}

@Component({
  selector: 'app-tourist-spots-booking',
  templateUrl: './tourist-spots-booking.component.html',
  styleUrls: ['./tourist-spots-booking.component.scss']
})
export class TouristSpotsBookingComponent {
  bookedSpots: BookedTouristSpot[] = [];

  private storageKey = 'touristSpots_currentBooking';

  constructor(private router: Router) {
    // Load persisted state if present
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        this.bookedSpots = JSON.parse(raw) || [];
      } catch {
        this.bookedSpots = [];
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.bookedSpots));
  }

  get grandTotal(): number {
    return this.bookedSpots.reduce((sum, spot) => sum + spot.total, 0);
  }

  onAddTouristBooking(selection: TouristBookingSelection, spotId: string) {
    // Check if spot already exists
    const existingIndex = this.bookedSpots.findIndex(spot => spot.id === spotId);
    
    // Define unit prices for each spot
    const spotPrices = this.getSpotPrices(spotId);
    
    const peopleCount = selection.counts.adults + selection.counts.children;
    
    // Calculate breakdown
    const breakdown = {
      entry: spotPrices.entry * peopleCount,
      parking: spotPrices.parking * selection.counts.vehicles,
      camera: spotPrices.camera * selection.counts.cameras,
      addOns: this.calculateAddOnsTotal(selection.addOns, spotId)
    };

    const bookedSpot: BookedTouristSpot = {
      id: spotId,
      name: selection.name,
      location: selection.location,
      type: selection.type,
      counts: selection.counts,
      unitPrices: spotPrices,
      breakdown,
      total: breakdown.entry + breakdown.parking + breakdown.camera + breakdown.addOns,
      peopleCount,
      addOns: selection.addOns
    };

    if (existingIndex >= 0) {
      // Update existing spot
      this.bookedSpots.splice(existingIndex, 1, bookedSpot);
    } else {
      // Add new spot
      this.bookedSpots = [...this.bookedSpots, bookedSpot];
    }

    this.persist();
    this.showAddedToBookingFeedback(selection.name);
  }

  removeSpot(index: number) {
    this.bookedSpots.splice(index, 1);
    this.bookedSpots = [...this.bookedSpots];
    this.persist();
  }

  proceedToCheckout() {
    if (this.bookedSpots.length === 0) return;
    
    // Store booking data for checkout
    localStorage.setItem('touristSpotsBooking', JSON.stringify({
      spots: this.bookedSpots,
      total: this.grandTotal,
      timestamp: new Date().toISOString()
    }));

    // Navigate to checkout page
    this.router.navigate(['/tourist-spots-checkout']);
  }

  private getSpotPrices(spotId: string): { entry: number; parking: number; camera: number } {
    const priceMap: { [key: string]: { entry: number; parking: number; camera: number } } = {
      'jalatarangini': { entry: 50, parking: 20, camera: 100 },
      'amruthadhara': { entry: 30, parking: 15, camera: 50 },
      'rampa': { entry: 40, parking: 25, camera: 75 },
      'maredumilli': { entry: 60, parking: 30, camera: 120 }
    };
    
    return priceMap[spotId] || { entry: 0, parking: 0, camera: 0 };
  }

  private calculateAddOnsTotal(selectedAddOnIds: string[], spotId: string): number {
    const addOnsMap: { [key: string]: { [key: string]: number } } = {
      'jalatarangini': { 'guide-jalatarangini': 500 },
      'amruthadhara': { 'guide-amruthadhara': 400, 'refreshments-amruthadhara': 200 },
      'rampa': { 'guide-rampa': 600, 'trek-rampa': 300 },
      'maredumilli': { 'guide-maredumilli': 700, 'boating-maredumilli': 500 }
    };

    const spotAddOns = addOnsMap[spotId] || {};
    return selectedAddOnIds.reduce((total, addOnId) => {
      return total + (spotAddOns[addOnId] || 0);
    }, 0);
  }

  private showAddedToBookingFeedback(spotName: string) {
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5';
    feedback.style.zIndex = '9999';
    feedback.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i>${spotName} added to booking!`;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }
}