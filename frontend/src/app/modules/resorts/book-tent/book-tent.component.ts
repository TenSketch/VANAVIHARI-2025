import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TentService } from '../../../services/tent.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface Tent {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  capacity: number;
  image?: string;
  images?: string[];
  price?: number;
  accommodationType?: string;
  brand?: string;
  tentBase?: string;
  amenities?: string[];
}

interface ResortInfo {
  title: string;
  about: string;
}

@Component({
  selector: 'app-book-tent',
  templateUrl: './book-tent.component.html',
  styleUrls: ['./book-tent.component.scss']
})
export class BookTentComponent implements OnInit {
  resortKey: string = 'vanavihari';
  resortTitle: string = '';
  tents: Tent[] = [];
  selectedResortInfo: ResortInfo | null = null;
  // mimic test-room flags
  isMobile: boolean = false;
  bookedTents: any[] = [];
  private bookingStorageKey = 'booking_tents';
  // image viewer state
  isFullImageVisible = false;
  fullImageSrc: string | null = null;
  @ViewChildren('cardContainer') cardContainers!: QueryList<ElementRef>;

  ngAfterViewInit() {
    // nothing for now, placeholders accessible via cardContainers
  }

  constructor(
    private route: ActivatedRoute,
    private tentService: TentService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path || '';
    if (path.startsWith('vanavihari')) {
      this.resortKey = 'vanavihari';
      this.resortTitle = 'vanavihari';
      this.selectedResortInfo = {
        title: 'vanavihari',
        about: 'Vanavihari, Maredumilli is situated in the serene landscapes of Maredumilli, beckoning eco-tourism aficionados with its abundance of bamboo trees. This guesthouse, committed to community well-being, offers a serene retreat amidst natural surroundings. With its snug cottages and rooms, it conveniently lies close to Amruthadhara Waterfalls, promising guests a peaceful ambiance. Nearby street food eateries present the opportunity to savor the distinctive flavor of bamboo biriyani. Stepping out for a night or morning stroll unveils a heavenly experience for visitors.'
      };
    } else if (path.startsWith('karthikavanm')) {
      this.resortKey = 'karthikavanm';
      this.resortTitle = 'karthikavanm';
      this.selectedResortInfo = { title: 'karthikavanm', about: 'Karthikavanm tented area offers eco-friendly tent stays with access to nearby nature attractions.' };
    }

    this.tentService.getTents(this.resortKey).subscribe({
      next: (data) => {
        // enrich tents with full images array: if image is present, generate 4 variants or reuse same
        this.tents = (data || []).map((t: any) => {
          const base = t.image || '';
          // if base contains 'tent1' or 'tent2' we'll also include tent3,tent4 from same folder
          let images: string[] = [];
          let folder = '';
          if (base) {
            folder = base.substring(0, base.lastIndexOf('/') + 1);
          } else {
            // fallback to resort-specific folder under assets
            folder = `/assets/img/tent/${this.resortKey}/`;
          }
          images = [
            `${folder}tent1.jpg`,
            `${folder}tent2.jpg`,
            `${folder}tent3.jpg`,
            `${folder}tent4.jpg`,
          ];
          // If this is the 2-person tent, append the extra generated images from the shared folder
          const isTwoPerson = (t.name || '').toLowerCase().includes('2 person') || (t.id || '').toLowerCase().includes('2p');
          if (isTwoPerson) {
            const sharedFolder = `/assets/images/Tent/2 person/`;
            const sharedImgs = [
              `${sharedFolder}Gemini_Generated_Image_93fsiz93fsiz93fs.png`,
              `${sharedFolder}Screenshot 2025-10-07 202154.png`,
              `${sharedFolder}Screenshot 2025-10-07 202203.png`,
            ];
            // Avoid duplicates
            images = [...images, ...sharedImgs.filter(s => !images.includes(s))];
          }
          // Also support 4-person tent shared images
          const isFourPerson = (t.name || '').toLowerCase().includes('4 person') || (t.id || '').toLowerCase().includes('4p');
          if (isFourPerson) {
            const sharedFolder4 = `/assets/images/Tent/4 person/`;
            const sharedImgs4 = [
              `${sharedFolder4}Screenshot 2025-10-07 203154.png`,
              `${sharedFolder4}Screenshot 2025-10-07 203158.png`,
              `${sharedFolder4}Screenshot 2025-10-07 203202.png`,
            ];
            images = [...images, ...sharedImgs4.filter(s => !images.includes(s))];
          }
          return {
            ...t,
            images,
            price: t.price,
            accommodationType: t.accommodationType || 'Camping Tent',
            brand: t.brand || 'Decathlon',
            tentBase: t.tentBase || 'Concrete',
            amenities: t.amenities || [],
          } as Tent;
        });
      },
      error: (err) => console.error('Failed to load tents', err),
    });
    // load persisted booking (if any)
    this.loadBookingSummary();

    // detect mobile layout
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    // compute booking summary top offset (so it sits below the fixed navbar)
    this.updateBookingSummaryTop();
    // recalc on resize to handle responsive navbar height
    window.addEventListener('resize', this.updateBookingSummaryTop);
  }

  ngOnDestroy(): void {
    // cleanup listener
    try { window.removeEventListener('resize', this.updateBookingSummaryTop); } catch { }
  }

  /**
   * Compute the fixed navbar height and expose it as a CSS variable
   * so .booking-summary-bar can use it as `top` value and sit below the nav.
   */
  private updateBookingSummaryTop = (): void => {
    try {
      const nav = document.querySelector('nav.navbar.fixed-top') as HTMLElement | null;
      const height = nav ? Math.ceil(nav.getBoundingClientRect().height) : 100;
      // add a small extra gap (4px) so the summary doesn't touch the navbar
      const offset = height + 4;
      document.documentElement.style.setProperty('--booking-summary-top', `${offset}px`);
    } catch (e) {
      // fallback: set a default
      document.documentElement.style.setProperty('--booking-summary-top', `100px`);
    }
  }

  openFullImage(src: string) {
    this.fullImageSrc = src;
    this.isFullImageVisible = true;
  }

  // --- Booking summary helpers (adapted from tourist spots) ---
  private persistBooking() {
    localStorage.setItem(this.bookingStorageKey, JSON.stringify(this.bookedTents));
  }

  loadBookingSummary() {
    const raw = localStorage.getItem(this.bookingStorageKey);
    try {
      this.bookedTents = raw ? JSON.parse(raw) : [];
    } catch {
      this.bookedTents = [];
    }
  }

  addTentToBooking(tent: any) {
    const existing = this.bookedTents.findIndex((b: any) => b.id === tent.id);
    const booked = {
      id: tent.id,
      name: tent.name || 'Tent',
      capacity: tent.capacity || 2,
      price: Number(tent.price) || 0,
      total: Number(tent.price) || 0
    };
    if (existing >= 0) {
      this.bookedTents.splice(existing, 1, booked);
    } else {
      this.bookedTents = [...this.bookedTents, booked];
    }
    this.persistBooking();
    this.showAddedToBookingFeedback(booked.name);
  }

  removeTent(index: number) {
    this.bookedTents.splice(index, 1);
    this.bookedTents = [...this.bookedTents];
    this.persistBooking();
  }

  get grandTotal(): number {
    return this.bookedTents.reduce((sum, t) => sum + (Number(t.total) || Number(t.price) || 0), 0);
  }

  proceedToCheckout() {
    if (this.bookedTents.length === 0) return;
    localStorage.setItem('tentsBooking', JSON.stringify({ tents: this.bookedTents, total: this.grandTotal, timestamp: new Date().toISOString() }));
    // navigate to a checkout page if exists; fallback to console.log
    try {
      this.router.navigate(['/tent-checkout']);
    } catch (e) {
      console.log('Proceeding to checkout', this.bookedTents, this.grandTotal);
    }
  }

  private showAddedToBookingFeedback(name: string) {
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5';
    feedback.style.zIndex = '9999';
    feedback.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i>${name} added to booking!`;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  closeFullImage() {
    this.isFullImageVisible = false;
    this.fullImageSrc = null;
  }

  scrollLeft(index: number) {
    const el = this.cardContainers?.toArray()[index];
    if (el && el.nativeElement) {
      const container = el.nativeElement as HTMLElement;
      const offset = Math.round(container.clientWidth * 0.7) || 200;
      container.scrollTo({ left: container.scrollLeft - offset, behavior: 'smooth' });
    }
  }

  scrollRight(index: number) {
    const el = this.cardContainers?.toArray()[index];
    if (el && el.nativeElement) {
      const container = el.nativeElement as HTMLElement;
      const offset = Math.round(container.clientWidth * 0.7) || 200;
      container.scrollTo({ left: container.scrollLeft + offset, behavior: 'smooth' });
    }
  }

  // Booking summary logic removed (booking state handled elsewhere now)

  /**
   * Build a list of amenity items for display with icons.
   * The count for some items is based on the tent's capacity.
   */
  getAmenityItems(tent: Tent): { icon?: string; img?: string; text: string }[] {
    const cap = Number(tent.capacity) || 2;
    return [
      { icon: 'fas fa-bed', text: 'Beds' },
      { icon: 'fas fa-head-side-cough', text: 'Pillows' },
      { icon: 'fas fa-bed', text: 'Bed sheets' },
      { img: '/assets/icons/comforter.svg', icon: 'fas fa-blanket', text: 'Comforters' },
      { icon: 'fas fa-bath', text: 'Towels' },
      { icon: 'fas fa-chair', text: 'Chairs' }
    ];
  }
}
