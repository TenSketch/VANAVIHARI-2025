import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TouristBookingSelection } from '../../shared/tourist-spot-selection/tourist-spot-selection.component';
import { TOURIST_SPOT_CATEGORIES, TouristSpotCategory, TouristSpotConfig } from './tourist-spots.data';

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
    twoWheelers?: number;
    fourWheelers?: number;
  };
  unitPrices: {
    entry: number;
    parking: number;
    camera: number;
    parkingTwoWheeler?: number;
    parkingFourWheeler?: number;
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

interface CategoryFilter {
  label: string;
  value: string;
  selected: boolean;
}

interface TimeFilter {
  label: string;
  value: string;
}

@Component({
  selector: 'app-tourist-spots-booking',
  templateUrl: './tourist-spots-booking.component.html',
  styleUrls: ['./tourist-spots-booking.component.scss']
})
export class TouristSpotsBookingComponent {
  bookedSpots: BookedTouristSpot[] = [];
  categories: TouristSpotCategory[] = TOURIST_SPOT_CATEGORIES;
  filteredCategories: TouristSpotCategory[] = [];

  // Accordion state
  isBookingSummaryExpanded: boolean = true;
  isFiltersExpanded: boolean = true;
  panelOpenState: boolean = false;
  isMobile: boolean = false;

  // Filter options
  categoryFilters: CategoryFilter[] = [
    { label: 'Waterfalls', value: 'Waterfall', selected: false },
    { label: 'Picnic Spots', value: 'Picnic', selected: false },
    { label: 'Eco Attractions', value: 'Eco', selected: false },
    { label: 'Trekking Trails', value: 'Trek', selected: false },
    { label: 'View Points', value: 'ViewPoint', selected: false }
  ];

  timeFilters: TimeFilter[] = [
    { label: 'All Time Durations', value: 'all' },
    { label: 'Morning to Afternoon', value: 'morning-afternoon' },
    { label: 'Morning to Evening', value: 'morning-evening' },
    { label: 'Morning and Evening', value: 'morning-and-evening' }
  ];

  selectedTimeFilter: string = 'all';

  // Flatten map for quick lookup usage (e.g., pricing)
  private spotMap: { [id: string]: TouristSpotConfig } = {};

  private storageKey = 'touristSpots_currentBooking';

  // Hero slideshow state
  heroImages: string[] = [];
  activeSlide: number = 0;
  private slideIntervalMs: number = 3000; // 3s per slide (user requested)
  private slideTimer: any = null;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    // Build lookup map
    this.categories.forEach(cat => cat.spots.forEach(s => this.spotMap[s.id] = s));
    // Load persisted state if present
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        this.bookedSpots = JSON.parse(raw) || [];
      } catch {
        this.bookedSpots = [];
      }
    }
    // Initialize filtered  
    this.applyFilters();

    // Initialize hero images from first images found in categories (fallback safe list)
    this.initHeroImages();
    this.startAutoplay();

    // Detect mobile breakpoint
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngAfterViewInit(): void {
    // ensure autoplay started after view init
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private initHeroImages() {
    const imgs: string[] = [];
    // try to collect one representative image from each category
    this.categories.forEach(cat => {
      cat.spots.forEach(s => {
        if (s.images && s.images.length) {
          imgs.push(s.images[0]);
        }
      });
    });

    // Deduplicate and keep up to 6 images to avoid heavy loads
    this.heroImages = Array.from(new Set(imgs)).slice(0, 6);

    // Fallback images if none found
    if (this.heroImages.length === 0) {
      this.heroImages = [
        'assets/img/TOURIST-PLACES/Jalatarangini-Waterfalls.jpg',
        'assets/img/TOURIST-PLACES/Amruthadhara-Waterfalls.jpg',
        'assets/img/TOURIST-PLACES/MPCA.jpg'
      ];
    }
  }

  goToSlide(index: number) {
    this.activeSlide = index % this.heroImages.length;
    // reset timer so user interaction delays the next autoplay
    this.restartAutoplay();
  }

  private startAutoplay() {
    if (this.slideTimer) return;
    this.slideTimer = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.heroImages.length;
    }, this.slideIntervalMs);
  }

  private stopAutoplay() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  private restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
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
    
    // Calculate parking based on split or generic
    let parkingTotal = 0;
    if (spotPrices.parkingTwoWheeler !== undefined && spotPrices.parkingFourWheeler !== undefined) {
      // Use split parking calculation
      parkingTotal = (spotPrices.parkingTwoWheeler * (selection.counts.twoWheelers || 0)) + 
                     (spotPrices.parkingFourWheeler * (selection.counts.fourWheelers || 0));
    } else {
      // Use generic parking calculation
      parkingTotal = spotPrices.parking * selection.counts.vehicles;
    }
    
    // Calculate breakdown
    const breakdown = {
      entry: spotPrices.entry * peopleCount,
      parking: parkingTotal,
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

  private getSpotPrices(spotId: string): { entry: number; parking: number; camera: number; parkingTwoWheeler?: number; parkingFourWheeler?: number } {
    const cfg = this.spotMap[spotId];
    if (!cfg) return { entry: 0, parking: 0, camera: 0 };
    const { entryPerPerson, parkingPerVehicle, cameraPerCamera, parkingTwoWheeler, parkingFourWheeler } = cfg.fees;
    return { 
      entry: entryPerPerson, 
      parking: parkingPerVehicle, 
      camera: cameraPerCamera,
      parkingTwoWheeler,
      parkingFourWheeler
    };
  }

  private calculateAddOnsTotal(selectedAddOnIds: string[], spotId: string): number {
    const cfg = this.spotMap[spotId];
    if (!cfg) return 0;
    // Build price map from config addOns (numeric prices only)
    const priceMap: { [key: string]: number } = {};
    cfg.addOns.forEach(a => {
      if (typeof a.price === 'number') priceMap[a.id] = a.price;
    });
    return selectedAddOnIds.reduce((sum, id) => sum + (priceMap[id] || 0), 0);
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

  // Filter methods
  applyFilters() {
    const selectedCategories = this.categoryFilters
      .filter(f => f.selected)
      .map(f => f.value);

    // If no category is selected, show all categories
    const shouldFilterByCategory = selectedCategories.length > 0;

    this.filteredCategories = this.categories.map(category => {
      // Filter spots based on category filter
      let filteredSpots = category.spots;

      if (shouldFilterByCategory) {
        filteredSpots = filteredSpots.filter(spot => 
          selectedCategories.includes(spot.category)
        );
      }

      // Apply time filter (placeholder logic - adjust based on your data)
      if (this.selectedTimeFilter !== 'all') {
        filteredSpots = this.filterByTime(filteredSpots);
      }

      return {
        ...category,
        spots: filteredSpots
      };
    }).filter(category => category.spots.length > 0);
  }

  private filterByTime(spots: TouristSpotConfig[]): TouristSpotConfig[] {
    // Filter spots based on selected time filter
    if (this.selectedTimeFilter === 'all') {
      return spots;
    }

    return spots.filter(spot => {
      // Match the timing field with the selected filter
      return spot.timing === this.selectedTimeFilter;
    });
  }

  clearFilters() {
    // Reset all category filters
    this.categoryFilters.forEach(f => f.selected = false);
    // Reset time filter
    this.selectedTimeFilter = 'all';
    // Reapply filters
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    const hasCategoryFilter = this.categoryFilters.some(f => f.selected);
    const hasTimeFilter = this.selectedTimeFilter !== 'all';
    return hasCategoryFilter || hasTimeFilter;
  }

  hasAnySpots(): boolean {
    return this.filteredCategories.some(cat => cat.spots.length > 0);
  }

  // Accordion toggle methods
  toggleBookingSummary() {
    this.isBookingSummaryExpanded = !this.isBookingSummaryExpanded;
  }

  toggleFilters() {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }
}