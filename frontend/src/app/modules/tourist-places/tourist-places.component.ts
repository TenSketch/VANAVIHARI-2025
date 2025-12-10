import { Component, Renderer2 } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { TouristBookingSelection } from '../../shared/tourist-spot-selection/tourist-spot-selection.component';
import { TouristSpotService } from '../../services/tourist-spot.service';

@Component({
  selector: 'app-tourist-places',
  templateUrl: './tourist-places.component.html',
  styleUrls: ['./tourist-places.component.scss'],
})
export class TouristPlacesComponent {
  // Visibility flags to control display of waterfalls & picnic spot sections
  showWaterfalls = false; // Jalatarangini & Amruthadhara
  showPicnicSpots = false; // Karthikavanam & MPCA

  constructor(private renderer: Renderer2, private router: Router, private touristSpotService: TouristSpotService) {}

  ngOnInit() {
    this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }
  
  async onAddTouristBooking(sel: TouristBookingSelection, spotId?: string) {
    try {
      // Resolve pricing from backend if available (spotId commonly a slug)
      const idOrSlug = spotId || 'jalatarangini';
      let prices = { entry: 0, parking: 0, camera: 0 };
      try {
        const resp: any = await firstValueFrom(this.touristSpotService.getTouristSpotBySlug(idOrSlug));
        const spot = resp?.touristSpot;
        if (spot) {
          prices = {
            entry: Number(spot.entryFees || 0),
            parking: Number(spot.parking2W ?? spot.parking ?? spot.parkingPerVehicle ?? 0),
            camera: Number(spot.cameraFees || 0)
          };
        }
      } catch (e) {
        // fallback to zeroed prices
        console.warn('Failed to fetch spot pricing, falling back to defaults', e);
      }
      const id = idOrSlug;
      const people = (sel.counts.adults || 0) + (sel.counts.children || 0);
      const breakdown = {
        entry: prices.entry * people,
        parking: prices.parking * (sel.counts.vehicles || 0),
        camera: prices.camera * (sel.counts.cameras || 0),
        addOns: 0,
      };
      const bookedSpot = {
        id,
        name: sel.name,
        location: sel.location,
        type: sel.type,
        counts: sel.counts,
        unitPrices: prices,
        breakdown,
        total: breakdown.entry + breakdown.parking + breakdown.camera + breakdown.addOns,
        peopleCount: people,
        addOns: sel.addOns || [],
      };

      const storageKey = 'touristSpots_currentBooking';
      const raw = localStorage.getItem(storageKey);
      const list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((s: any) => s.id === id);
      if (idx >= 0) list.splice(idx, 1, bookedSpot); else list.push(bookedSpot);
      localStorage.setItem(storageKey, JSON.stringify(list));

      // Navigate user to the booking UI where summary is shown
      this.router.navigate(['/tourist-places']);
    } catch (e) {
      console.error('Failed to add booking', e);
    }
  }
}
