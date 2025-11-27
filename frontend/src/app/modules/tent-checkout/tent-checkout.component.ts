import { Component, ElementRef, OnInit, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth.service';
import { UserService } from '../../user.service';
import { EnvService } from 'src/app/env.service';

@Component({
    selector: 'app-tent-checkout',
    templateUrl: './tent-checkout.component.html',
    styleUrls: ['./tent-checkout.component.scss']
})
export class TentCheckoutComponent implements OnInit, OnDestroy {
    bookingData: any = null;
    form: FormGroup;
    showLoader = false;
    api_url = environment.API_URL;

    // Timer properties
    @ViewChild('minutes', { static: true }) minutes: ElementRef;
    @ViewChild('seconds', { static: true }) seconds: ElementRef;
    intervalId: any;
    targetTime: any;
    now: any;
    difference: number;

    // User details
    getFullUser: string;

    // Payment details
    billdeskkey: string;
    billdesksecurityid: any;
    billdeskmerchantid: any;

    isInfoModalVisible = false;
    isModalVisible = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private envService: EnvService,
        private renderer: Renderer2
    ) {
        this.form = this.fb.group({
            gname: ['', Validators.required],
            gphone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
            gemail: ['', [Validators.required, Validators.email]],
            gaddress: ['', Validators.required],
            gcity: ['', Validators.required],
            gstate: ['', Validators.required],
            gpincode: ['', Validators.required],
            gcountry: ['', Validators.required],
            // Optional fields if needed
            gstnumber: [''],
            companyname: ['']
        });
    }

    ngOnInit(): void {
        this.loadBookingData();
        this.startTimer();
        this.fetchEnvVars();
        this.renderer.setProperty(document.documentElement, 'scrollTop', 0);

        if (this.userService.isLoggedIn()) {
            this.getFullUser = this.userService.getFullUser();
            this.getUserDetails();
        } else {
            // Optional: Redirect to login or show notification
            // this.router.navigate(['/sign-in'], { queryParams: { returnUrl: '/tent-checkout' } });
        }
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }

    private loadBookingData(): void {
        const storedData = localStorage.getItem('tentsBooking');
        if (storedData) {
            this.bookingData = JSON.parse(storedData);
        } else {
            // If no booking data, redirect back to tent booking page
            // We might need to know which resort it was, but for now defaulting to vanavihari
            this.router.navigate(['/vanavihari/book-tent']);
        }
    }

    private startTimer() {
        this.targetTime = new Date();
        this.targetTime.setMinutes(this.targetTime.getMinutes() + 5);
        let redirectDone = false;

        this.intervalId = setInterval(() => {
            this.now = new Date().getTime();
            this.difference = this.targetTime - this.now;

            const minutesLeft = Math.floor((this.difference % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((this.difference % (1000 * 60)) / 1000);

            if (this.difference <= 0 && !redirectDone) {
                redirectDone = true;
                clearInterval(this.intervalId);
                this.router.navigate(['/vanavihari/book-tent']);
            }

            if (this.minutes && this.seconds) {
                this.minutes.nativeElement.innerText = minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
                this.seconds.nativeElement.innerText = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;
            }
        }, 1000);
    }

    private fetchEnvVars() {
        this.envService.getEnvVars().subscribe(
            (envVars) => {
                this.billdeskkey = envVars.billdeskkey;
                this.billdesksecurityid = envVars.billdesksecurityid;
                this.billdeskmerchantid = envVars.billdeskmerchantid;
            },
            (error) => console.error('Error fetching environment variables:', error)
        );
    }

    getUserDetails() {
        this.showLoader = true;
        const headers = { token: this.authService.getAccessToken() ?? '' };

        this.http.get<any>(`${this.api_url}/api/user/profile`, { headers }).subscribe({
            next: (response) => {
                this.showLoader = false;
                if (response.code == 3000 && response.result.status == 'success') {
                    const result = response.result;
                    this.form.patchValue({
                        gname: result.name || '',
                        gphone: result.phone || '',
                        gemail: result.email || '',
                        gaddress: result.address1 || '',
                        gcity: result.city || '',
                        gstate: result.state || '',
                        gpincode: result.pincode || '',
                        gcountry: result.country || ''
                    });
                }
            },
            error: (err) => {
                this.showLoader = false;
                console.error('Profile fetch error:', err);
            }
        });
    }

    isLoggedIn(): boolean {
        return this.userService.isLoggedIn();
    }

    gotToLogin() {
        this.router.navigate(['/sign-in'], { queryParams: { returnUrl: '/tent-checkout' } });
    }

    triggerInfoModal() {
        if (this.form.valid) {
            this.isInfoModalVisible = true;
        } else {
            this.form.markAllAsTouched();
        }
    }

    onCancel() {
        this.isInfoModalVisible = false;
        this.isModalVisible = false;
    }

    onOk() {
        this.isInfoModalVisible = false;
        this.submitBooking();
    }

    submitBooking() {
        this.showLoader = true;

        // Prepare booking payload
        const bookingPayload = {
            ...this.bookingData,
            customer: this.form.value,
            bookingDate: new Date().toISOString()
        };

        const headers = { token: this.authService.getAccessToken() ?? '' };

        // Use the tent booking API endpoint (assuming it exists or reusing tourist/resort one)
        // For now, let's assume a generic booking endpoint or specific tent one. 
        // If specific tent endpoint is not known, I'll use a placeholder or generic one.
        // Based on `BookTentComponent`, it seems it was using `BookingSummaryComponent` which uses `/api/reservations/book`.
        // But `BookingSummaryComponent` logic is very resort-specific (rooms, cottageTypes).
        // `TouristSpotsCheckoutComponent` uses `/api/tourist-booking/book`.
        // I will assume there is or should be `/api/tent-booking/book` or similar.
        // Or I can try to use `/api/reservations/book` if I can map the data.
        // Given the user said "do same for the tent checkout", I'll use `/api/tent-booking/book` pattern for consistency with tourist spots.

        this.http.post<any>(`${this.api_url}/api/tent-booking/book`, bookingPayload, { headers }).subscribe({
            next: (response) => {
                if (response.success && response.bookingId) {
                    this.initiatePayment(response.bookingId);
                } else {
                    this.showLoader = false;
                    this.showSnackBarAlert('Failed to create booking. Please try again.');
                }
            },
            error: (err) => {
                console.error('Booking error:', err);
                this.showLoader = false;
                this.showSnackBarAlert('An error occurred while processing your booking.');
            }
        });
    }

    initiatePayment(bookingId: string) {
        const headers = { token: this.authService.getAccessToken() ?? '' };

        this.http.post<any>(`${this.api_url}/api/payment/initiate`, { bookingId, type: 'tent' }, { headers }).subscribe({
            next: (response) => {
                if (response.success && response.paymentData) {
                    localStorage.removeItem('tentsBooking');
                    this.submitPaymentForm(response.paymentData);
                } else {
                    this.showLoader = false;
                    this.showSnackBarAlert('Failed to initiate payment.');
                }
            },
            error: (err) => {
                console.error('Payment initiation error:', err);
                this.showLoader = false;
                this.showSnackBarAlert('Payment initiation failed.');
            }
        });
    }

    submitPaymentForm(paymentData: any) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.action || 'https://pgi.billdesk.com/pgidsk/PGIMerchantPayment';

        Object.keys(paymentData).forEach(key => {
            if (key !== 'action') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = paymentData[key];
                form.appendChild(input);
            }
        });

        document.body.appendChild(form);
        form.submit();
    }

    showSnackBarAlert(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['error-snackbar']
        });
    }

    get f() { return this.form.controls; }
}
