# Chopelah - Hawker Seat Booking App

## Project Overview
Chopelah is a web application that allows users to book and manage seats at hawker centres. The app uses Firebase as the backend database and is built with HTML, CSS, JavaScript, and Bootstrap.

## What We've Done So Far

### 1. Firebase Setup
- Created a Firebase project called "chopelah"
- Firebase is a backend service by Google that handles our database without needing SQL
- All team members connect to the same Firebase project, so data is shared in real-time
- Firebase automatically saves all data to Google's servers

### 2. Firebase Configuration
- Created `firebase-config.js` - a shared file with our Firebase credentials
- This file connects our app to our Firebase project
- **Important:** Don't change the config values; everyone uses the same one to access the same database
- The file exports `db` so other files can import it and use the database

### 3. Testing
- Created `test.html` to verify Firebase connection works
- The test file has three buttons:
  - Test Connection: checks if Firebase is accessible
  - Add Test Data: writes test data to the database
  - View Test Data: reads and displays all test data

### 4. Firebase Functions Created
We've written reusable functions for the app:

**booking.js** - Booking functions:
- `bookSeat(userId, userName, stallName, seatNumber, duration)` - Book a seat
- `updateBooking(bookingId, updatedData)` - Change booking details
- `cancelBooking(bookingId, reason)` - Cancel a booking (marked as "cancelled", not deleted)
- `deleteBooking(bookingId)` - Permanently delete a booking

These functions handle all database operations so team members don't have to write Firebase code themselves.

## File Structure
```
chopelah-project/
├── firebase-config.js          (Shared Firebase setup)
├── test.html                   (Testing file)
├── booking.js                  (Booking functions)
├── index.html                  (Home page)
├── css/
│   └── styles.css              (Shared styling)
├── js/
│   ├── firebase-config.js      (Copy of config)
│   └── [page-specific files]
└── README.md                   (This file)
```

## Data Structure in Firebase
We store data in collections (like tables):

**bookings collection:**
- `userId`: User's unique ID
- `userName`: User's name
- `stallName`: Name of the hawker stall
- `seatNumber`: Which seat (1-10, etc.)
- `duration`: How long booking is for (in minutes)
- `bookingTime`: When the booking was made
- `status`: "active" or "cancelled"
- `cancelReason`: Why it was cancelled (if applicable)

(More collections can be added as needed: users, hawker_stalls, etc.)

## How to Use Firebase Functions

### Booking a Seat
```javascript
import { bookSeat } from "./booking.js";

bookSeat("user123", "John Tan", "Chicken Rice", 5, 30)
  .then(result => {
    if (result.success) {
      alert("Booking successful! ID: " + result.bookingId);
    } else {
      alert(result.message);
    }
  });
```

### Updating a Booking
```javascript
import { updateBooking } from "./booking.js";

updateBooking("booking_id_123", { seatNumber: 8, duration: 60 })
  .then(result => alert(result.message));
```

### Cancelling a Booking
```javascript
import { cancelBooking } from "./booking.js";

cancelBooking("booking_id_123", "Changed my mind")
  .then(result => alert(result.message));
```

## Team Workflow

### Setup (One Person - 30 minutes)
1. Set up the folder structure
2. Create `firebase-config.js` with the shared Firebase config
3. Create `booking.js` with reusable functions
4. Push everything to Git

### Development (Everyone)
1. Clone the repo
2. Each person takes 1-2 pages to build (home, booking, confirmation, profile, etc.)
3. Use Git branches: `git checkout -b feature/page-name`
4. Import the shared Firebase functions into your page
5. Test locally by opening your HTML file in a browser
6. Push to Git and create a pull request

### Testing
1. Use `test.html` to verify Firebase is working
2. Add test data to confirm database is accessible
3. Test each function as you build pages

## Important Notes

### Everyone Connects to the Same Database
- When Person A books a seat, Person B will see it
- All data is shared in real-time
- Don't worry about syncing - Firebase handles it automatically

### Data is Saved Automatically
- When you call a function like `bookSeat()`, the data is immediately saved to Firebase
- No "save" button needed - it happens in the code

### Console Errors (Don't Worry)
- You may see errors like "WebChannelConnection RPC 'Listen' stream 400 Bad Request"
- These are normal - Firebase tries to set up real-time listeners
- They don't affect the app - your data is still being saved/read correctly

### Firebase Console
- You can view all data at https://console.firebase.google.com/
- Go to Firestore Database to see all collections and documents
- Useful for debugging

## Next Steps

### Short Term (This Week)
1. Test that Firebase connection works for everyone on the team
2. Create your page (home, booking, etc.) using Bootstrap
3. Build the basic HTML/CSS layout
4. Test locally by opening in browser

### Medium Term (Next Week)
1. Connect your page to Firebase functions
2. Wire up buttons to call booking functions
3. Display data on the page (e.g., show all bookings)
4. Test adding/updating/cancelling bookings

### Long Term (Deployment)
1. Deploy to Firebase Hosting when app is ready
2. Share the public URL so others can use it
3. Monitor for errors and fix issues

## Common Issues & Fixes

**"Import error: module not found"**
- Make sure file paths are correct
- Check that firebase-config.js is in the same folder

**"Firebase is not connected"**
- Check your API key in firebase-config.js
- Verify all team members have the same config

**"Data not appearing in my page"**
- Open browser console (F12) to see errors
- Check that your query/function is spelled correctly
- Verify you imported the function correctly

## Questions?
If something isn't working:
1. Check the browser console (F12) for error messages
2. Test using test.html to confirm Firebase is working
3. Ask your team - someone might have figured it out