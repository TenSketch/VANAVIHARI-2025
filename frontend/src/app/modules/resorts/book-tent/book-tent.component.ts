import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TentService } from '../../../services/tent.service';

interface Tent {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  capacity: number;
  image?: string;
  images?: string[];
  price?: number;
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
  showBookingSummary: boolean = false;
  // image viewer state
  isFullImageVisible = false;
  fullImageSrc: string | null = null;
  @ViewChildren('cardContainer') cardContainers!: QueryList<ElementRef>;

  ngAfterViewInit() {
    // nothing for now, placeholders accessible via cardContainers
  }

  constructor(private route: ActivatedRoute, private tentService: TentService) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path || '';
    if (path.startsWith('vanavihari')) {
      this.resortKey = 'vanavihari';
      this.resortTitle = 'Decathlon';
      this.selectedResortInfo = {
        title: 'Decathlon',
        about: 'Vanavihari, Maredumilli is situated in the serene landscapes of Maredumilli, beckoning eco-tourism aficionados with its abundance of bamboo trees. This guesthouse, committed to community well-being, offers a serene retreat amidst natural surroundings. With its snug cottages and rooms, it conveniently lies close to Amruthadhara Waterfalls, promising guests a peaceful ambiance. Nearby street food eateries present the opportunity to savor the distinctive flavor of bamboo biriyani. Stepping out for a night or morning stroll unveils a heavenly experience for visitors.'
      };
    } else if (path.startsWith('karthikavanm')) {
      this.resortKey = 'karthikavanm';
      this.resortTitle = 'Decathlon';
      this.selectedResortInfo = { title: 'Decathlon', about: 'Karthikavanm tented area offers eco-friendly tent stays with access to nearby nature attractions.' };
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
          return { ...t, images, price: t.price } as Tent;
        });
      },
      error: (err) => console.error('Failed to load tents', err),
    });

    // initialize booking summary from localStorage
    this.loadBookingSummary();
  }

  openFullImage(src: string) {
    this.fullImageSrc = src;
    this.isFullImageVisible = true;
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

  addTentToBooking(tent: any) {
    const key = 'booking_tents';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    // remove cost and extra guest fields - not present in our JSON
    const toAdd = { id: tent.id, name: tent.name, capacity: tent.capacity, price: tent.price };
    // prevent duplicates
    if (!list.find((i: any) => i.id === toAdd.id)) {
      list.push(toAdd);
      localStorage.setItem(key, JSON.stringify(list));
      this.loadBookingSummary();
    } else {
      // already present - silently ignore
    }
  }

  loadBookingSummary() {
    const key = 'booking_tents';
    const raw = localStorage.getItem(key);
    this.bookingTents = raw ? JSON.parse(raw) : [];
    this.showBookingSummary = this.bookingTents.length > 0;
  }

  removeTentFromBooking(tentId: string) {
    const key = 'booking_tents';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((i: any) => i.id !== tentId);
    localStorage.setItem(key, JSON.stringify(filtered));
    this.loadBookingSummary();
  }

  bookingTents: any[] = [];
}
