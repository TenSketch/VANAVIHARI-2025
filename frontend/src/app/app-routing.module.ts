import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { PageNotFoundPageComponentComponent } from './modules/under-construction/under-construction.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { TouristPlacesComponent } from './modules/tourist-places/tourist-places.component';
import { AboutVanavihariComponent } from './modules/about-vanavihari/about-vanavihari.component';
import { VanavihariMaredumilliComponent } from './modules/resorts/vanavihari-maredumilli/vanavihari-maredumilli.component';
import { JungleStarValamuruComponent } from './modules/resorts/jungle-star-valamuru/jungle-star-valamuru.component';
import { TribalCommunityComponent } from './modules/tribal-community/tribal-community.component';
import { AwardsNewsPublicationsComponent } from './modules/awards-news-publications/awards-news-publications.component';
import { PrivacyPolicyComponent } from './modules/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './modules/terms-and-conditions/terms-and-conditions.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { MyBookingsComponent } from './modules/my-bookings/my-bookings.component';
import { EmailVerificationComponent } from './auth/email-verification/email-verification.component';
import { ResortListingComponent } from './modules/resort-listing/resort-listing.component';
import { BookingSummaryComponent } from './modules/booking-summary/booking-summary.component';
import { ShowSuccessMessageComponent } from './auth/show-success-message/show-success-message.component';
import { ChangePasswordComponent } from './modules/change-password/change-password.component';
import { BookingStatusComponent } from './modules/booking-status/booking-status.component';
import { BookingStatusTestComponent } from './modules/booking-status-test/booking-status-test.component';
import { RoomsComponent } from './modules/resorts/rooms/rooms.component';
import { ReadPaymentTransactionResponseComponent } from './auth/read-payment-transaction-response/read-payment-transaction-response.component';
import { PaymentPoliciesComponent } from './modules/payment-policies/payment-policies.component';
import { ContactUsComponent } from './modules/contact-us/contact-us.component';
import { BiodiversityZoneComponent } from './modules/biodiversity-zone/biodiversity-zone.component';
import { FoodMenuComponent } from './modules/food-menu/food-menu.component';
import { CanDeactivateGuard } from './can-deactivate-guard.service';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { TestRoomComponent } from './modules/test-room/test-room.component';
import { CancelRequestComponent } from './modules/cancel-request/cancel-request.component';
import { TestBookingsComponent } from './modules/test-bookings/test-bookings.component';
import { CancelStatusComponent } from './modules/cancel-status/cancel-status.component';
import { CancelRequestManualComponent } from './modules/cancel-request-manual/cancel-request-manual.component';
import { TouristSpotsBookingComponent } from './modules/tourist-spots-booking/tourist-spots-booking.component';
import { TouristSpotsCheckoutComponent } from './modules/tourist-spots-checkout/tourist-spots-checkout.component';
import { TouristSpotsSuccessComponent } from './modules/tourist-spots-success/tourist-spots-success.component';


// const routes: Routes = [
//   { path: 'home', component: PageNotFoundPageComponentComponent },
//   { path: 'sign-in', component: PageNotFoundPageComponentComponent },
//   { path: 'sign-up', component: PageNotFoundPageComponentComponent },
//   { path: 'success', component: PageNotFoundPageComponentComponent },
//   {
//     path: 'email-verification/:userid/:token',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path: 'payment-transaction-rdurl',
//     component: PageNotFoundPageComponentComponent,
//   },
//   { path: 'about-vanavihari', component: PageNotFoundPageComponentComponent },
//   { path: 'my-account/settings', component: PageNotFoundPageComponentComponent },
//   { path: 'my-account/my-bookings', component: PageNotFoundPageComponentComponent },
//   {
//     path: 'resorts/vanavihari-maredumilli',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path: 'resorts/junglestar-valamuru',
//     component: PageNotFoundPageComponentComponent,
//   },
//   { path: 'tribal-community', component: PageNotFoundPageComponentComponent },
//   { path: 'privacy-policy', component: PageNotFoundPageComponentComponent },
//   { path: 'payment-policy', component: PageNotFoundPageComponentComponent },
//   { path: 'terms-and-conditions', component: PageNotFoundPageComponentComponent },
//   {
//     path: 'awards-and-publications',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path: 'booking-summary',
//     component: PageNotFoundPageComponentComponent,
//     canDeactivate: [CanDeactivateGuard],
//   },
//   { path: 'booking-status', component: PageNotFoundPageComponentComponent },
//   { path: 'resorts/rooms', component: PageNotFoundPageComponentComponent },
//   { path: 'tourist-destination', component: PageNotFoundPageComponentComponent },
//   { path: 'dashboard', component: PageNotFoundPageComponentComponent },
//   { path: 'resort-listing', component: PageNotFoundPageComponentComponent },
//   { path: 'change-password', component: PageNotFoundPageComponentComponent },
//   { path: 'contact-us', component: PageNotFoundPageComponentComponent },
//   { path: 'booking-status-test', component: PageNotFoundPageComponentComponent },
//   { path: 'biodiversity-zone', component: PageNotFoundPageComponentComponent },
//   { path: 'food-menu', component: PageNotFoundPageComponentComponent },
//   {
//     path: 'resorts/test-rooms', component: PageNotFoundPageComponentComponent
//   },
//   {
//     path: 'forgot-password/:userid/:token',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path:'reset-password',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path:'cancel-request',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path:'cancel-request-manual',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path:'test-bookings',
//     component: PageNotFoundPageComponentComponent,
//   },
//   {
//     path:'cancel-status',
//     component: PageNotFoundPageComponentComponent
//   },
//   { path: '', redirectTo: '/home', pathMatch: 'full' },
//   { path: '**', redirectTo: '/home' },
// ];


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'success', component: ShowSuccessMessageComponent },
  {
    path: 'email-verification/:userid/:token',
    component: EmailVerificationComponent,
  },
  {
    path: 'payment-transaction-rdurl',
    component: ReadPaymentTransactionResponseComponent,
  },
  { path: 'about-vanavihari', component: AboutVanavihariComponent },
  { path: 'my-account/settings', component: SettingsComponent },
  { path: 'my-account/my-bookings', component: MyBookingsComponent },
  {
    path: 'resorts/vanavihari-maredumilli',
    component: VanavihariMaredumilliComponent,
  },
  {
    path: 'resorts/junglestar-valamuru',
    component: JungleStarValamuruComponent,
  },
  { path: 'tribal-community', component: TribalCommunityComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'payment-policy', component: PaymentPoliciesComponent },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  {
    path: 'awards-and-publications',
    component: AwardsNewsPublicationsComponent,
  },
  {
    path: 'booking-summary',
    component: BookingSummaryComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  { path: 'booking-status', component: BookingStatusComponent },
  { path: 'resorts/rooms', component: RoomsComponent },
  { path: 'tourist-destination', component: TouristPlacesComponent },
  { path: 'tourist-places', component: TouristSpotsBookingComponent },
  { path: 'tourist-spots-checkout', component: TouristSpotsCheckoutComponent },
  { path: 'tourist-spots-success', component: TouristSpotsSuccessComponent },
  { path: 'dashboard', component: SettingsComponent },
  { path: 'resort-listing', component: ResortListingComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'booking-status-test', component: BookingStatusTestComponent },
  { path: 'biodiversity-zone', component: BiodiversityZoneComponent },
  { path: 'food-menu', component: FoodMenuComponent },
  {
    path: 'resorts/test-rooms', component: TestRoomComponent
  },
  {
    path: 'forgot-password/:userid/:token',
    component: ForgotPasswordComponent,
  },
  {
    path:'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path:'cancel-request',
    component: CancelRequestComponent,
  },
  {
    path:'cancel-request-manual',
    component: CancelRequestManualComponent,
  },
  {
    path:'test-bookings',
    component: TestBookingsComponent,
  },
  {
    path:'cancel-status',
    component:CancelStatusComponent
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
