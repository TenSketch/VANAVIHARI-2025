import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tourist-spots-checkout',
  templateUrl: './tourist-spots-checkout.component.html',
  styleUrls: ['./tourist-spots-checkout.component.scss']
})
export class TouristSpotsCheckoutComponent implements OnInit {
  bookingData: any = null;
  customerForm: FormGroup;
  selectedPaymentMethod: string = 'upi';
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.customerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      idProof: [''],
      address: [''],
      visitDate: ['', Validators.required],
      specialRequirements: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookingData();
    this.setMinVisitDate();
  }

  get serviceCharges(): number {
    if (!this.bookingData) return 0;
    return Math.round(this.bookingData.total * 0.05); // 5% service charges
  }

  get gstAmount(): number {
    if (!this.bookingData) return 0;
    const taxableAmount = this.bookingData.total + this.serviceCharges;
    return Math.round(taxableAmount * 0.18); // 18% GST
  }

  get finalTotal(): number {
    if (!this.bookingData) return 0;
    return this.bookingData.total + this.serviceCharges + this.gstAmount;
  }

  private loadBookingData(): void {
    const storedData = localStorage.getItem('touristSpotsBooking');
    if (storedData) {
      this.bookingData = JSON.parse(storedData);
    } else {
      // Redirect to booking page if no data found
      this.router.navigate(['/tourist-places']);
    }
  }

  private setMinVisitDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    this.customerForm.get('visitDate')?.setValue('');
    
    // Set min date attribute on the input
    setTimeout(() => {
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (dateInput) {
        dateInput.min = minDate;
      }
    }, 100);
  }

  proceedToPayment(): void {
    if (!this.customerForm.valid || !this.selectedPaymentMethod) {
      this.markFormGroupTouched();
      return;
    }

    const paymentData = {
      booking: this.bookingData,
      customer: this.customerForm.value,
      payment: {
        method: this.selectedPaymentMethod,
        amount: this.finalTotal,
        breakdown: {
          subtotal: this.bookingData.total,
          serviceCharges: this.serviceCharges,
          gst: this.gstAmount,
          total: this.finalTotal
        }
      },
      timestamp: new Date().toISOString()
    };

    // Store payment data for processing
    localStorage.setItem('touristSpotsPayment', JSON.stringify(paymentData));

    // Simulate payment gateway redirect
    this.simulatePaymentProcess(paymentData);
  }

  private simulatePaymentProcess(paymentData: any): void {
    // In a real implementation, you would redirect to a payment gateway
    // For now, we'll simulate the process
    
    console.log('Processing payment...', paymentData);
    
    // Show loading state
    const payButton = document.querySelector('.btn-success') as HTMLButtonElement;
    if (payButton) {
      payButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing...';
      payButton.disabled = true;
    }

    // Simulate payment processing time
    setTimeout(() => {
      // Generate a fake transaction ID
      const transactionId = 'TST' + Date.now().toString().slice(-8);
      
      // Store transaction result
      const transactionResult = {
        ...paymentData,
        transactionId,
        status: 'success',
        paymentDate: new Date().toISOString()
      };
      
      localStorage.setItem('touristSpotsTransaction', JSON.stringify(transactionResult));
      
      // Clear booking data
      localStorage.removeItem('touristSpotsBooking');
      localStorage.removeItem('touristSpotsPayment');
      
      // Redirect to success page
      this.router.navigate(['/tourist-spots-success'], {
        queryParams: { transactionId }
      });
    }, 3000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  goBackToBooking(): void {
    this.router.navigate(['/tourist-places']);
  }
}