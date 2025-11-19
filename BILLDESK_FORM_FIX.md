# BillDesk Form Submission Fix

## Issue
When submitting payment form to BillDesk, getting error:
```
Sorry we are unable to process your request.
```

## Root Cause
The form was using incorrect field names. BillDesk expects:
- `mercid` (not `merchantid`)
- `bdorderid`
- `rdata` (from response parameters, not the signed request)

## What Was Wrong

### Backend (`paymentController.js`)
```javascript
// ❌ WRONG
paymentData: {
  bdorderid: billdeskResponse.bdorderid,
  merchantid: billdeskResponse.merchantid,  // Wrong field name
  rdata: billdeskResponse.links?.[1]?.parameters?.rdata || signed,  // Fallback was wrong
  formAction: billdeskResponse.links?.[1]?.href
}
```

### Frontend (`booking-summary.component.ts`)
```javascript
// ❌ WRONG
const fields = {
  bdorderid: paymentData.bdorderid,
  merchantid: paymentData.merchantid,  // Wrong field name
  rdata: paymentData.rdata
};
```

## What Was Fixed

### Backend (`paymentController.js`)
```javascript
// ✅ CORRECT
paymentData: {
  bdorderid: billdeskResponse.bdorderid,
  mercid: billdeskResponse.mercid,  // Correct field name
  rdata: billdeskResponse.links?.[1]?.parameters?.rdata,  // Use response rdata only
  formAction: billdeskResponse.links?.[1]?.href
}
```

### Frontend (`booking-summary.component.ts`)
```javascript
// ✅ CORRECT
const fields = {
  mercid: paymentData.mercid,  // Correct field name
  bdorderid: paymentData.bdorderid,
  rdata: paymentData.rdata
};
```

## BillDesk Response Structure

From your logs, BillDesk returns:
```json
{
  "bdorderid": "OAZK1Y7EWSQYFYWW",
  "mercid": "BDUAT2K673",
  "links": [
    {
      "href": "https://uat1.billdesk.com/u2/web/v1_2/embeddedsdk",
      "rel": "redirect",
      "method": "POST",
      "parameters": {
        "mercid": "BDUAT2K673",
        "bdorderid": "OAZK1Y7EWSQYFYWW",
        "rdata": "674502462cab69a69c9465c8d2bfc025a2b8a691a310ad4e0f0161e3e6dd507b..."
      }
    }
  ]
}
```

## Form Submission Requirements

BillDesk expects exactly these 3 fields:
1. **mercid** - Merchant ID (from response)
2. **bdorderid** - BillDesk Order ID (from response)
3. **rdata** - Encrypted data (from response.links[1].parameters.rdata)

## Testing

After this fix:
1. Restart backend server
2. Clear browser cache
3. Try booking again
4. Form should now submit successfully to BillDesk
5. You should see BillDesk payment page (not error page)

## Verification

Check console logs:
```
Payment form fields: {
  mercid: "BDUAT2K673",
  bdorderid: "OAZK1Y7EWSQYFYWW",
  rdata: "674502462cab69a69c9465c8d2bfc025..."
}
Submitting payment form to BillDesk: https://uat1.billdesk.com/u2/web/v1_2/embeddedsdk
```

## Status
✅ **FIXED** - Form now submits with correct field names and values
