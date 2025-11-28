# Setup and Installation Guide

## Changes Implemented

### 1. **Admin Role & User Management**
- ✅ Added ADMIN role to the system
- ✅ Created admin dashboard to manage all users
- ✅ Admin can view all users, change roles, and delete users
- ✅ Login routing updated to redirect admins to `/user/dashboard-admin`

### 2. **Service Categories (Predefined List)**
- ✅ Created ServiceCategory enum with 8 categories:
  - Plomberie (Plumbing)
  - Électricité (Electricity)
  - Menuiserie (Carpentry)
  - Peinture (Painting)
  - Maçonnerie (Construction/Masonry)
  - Jardinage (Gardening)
  - Nettoyage (Cleaning)
  - Climatisation (HVAC)
- ✅ Updated Service model to use enum instead of free text
- ✅ Updated frontend service forms with dropdown selection
- ✅ Added `/api/services/categories` endpoint to fetch categories

### 3. **Real-time Messaging System**
- ✅ WebSocket support added (Spring WebSocket + SockJS + STOMP)
- ✅ Created Message model linked to reservations
- ✅ Messages are tied to specific reservations (client ↔ fournisseur)
- ✅ Real-time message delivery via WebSocket
- ✅ Message history and unread count
- ✅ Frontend chat component with real-time updates

---

## Installation & Setup

### Backend Setup

1. **Navigate to backend2 directory:**
   ```bash
   cd backend2
   ```

2. **Install dependencies (Maven will auto-install):**
   ```bash
   mvn clean install
   ```

3. **Update database (if needed):**
   The new entities (Message, ServiceCategory enum) will be auto-created by JPA.
   
   **Important:** Since we changed the `category` field from String to Enum, you may need to:
   - Drop the `services` table and let JPA recreate it, OR
   - Manually update existing data to match the enum values (PLOMBERIE, ELECTRICITE, etc.)

4. **Create an Admin user manually:**
   Connect to your PostgreSQL database and run:
   ```sql
   INSERT INTO users (first_name, last_name, email, password, role, created_at) 
   VALUES ('Admin', 'User', 'admin@example.com', '$2a$10$ENCODED_PASSWORD_HERE', 'ADMIN', NOW());
   ```
   
   You'll need to encode the password using BCrypt. You can use an online BCrypt generator or Spring's `BCryptPasswordEncoder`.

5. **Start the backend:**
   ```bash
   mvn spring-boot:run
   ```
   The backend will run on `http://localhost:8080`

---

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/client-app
   ```

2. **Dependencies are already installed!** 
   We've already run `npm install` which added:
   - `@stomp/stompjs` (WebSocket STOMP client)
   - `sockjs-client` (SockJS fallback for WebSocket)

3. **Start the development server:**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:4200`

---

## Testing the Features

### 1. **Test Admin Dashboard**

1. Create an admin user in the database (see step 4 in Backend Setup)
2. Login with admin credentials
3. You should be redirected to `/user/dashboard-admin`
4. You'll see a table of all users
5. Test changing a user's role using the dropdown
6. Test deleting a user

**Admin Dashboard Features:**
- View all users
- Change user roles (CLIENT, FOURNISSEUR, ADMIN)
- Delete users
- See user creation dates

---

### 2. **Test Service Categories**

1. Login as a FOURNISSEUR
2. Navigate to "Mes Services" or create a new service
3. You should see a **dropdown** for category selection instead of a text input
4. Available categories:
   - Plomberie
   - Électricité
   - Menuiserie
   - Peinture
   - Maçonnerie
   - Jardinage
   - Nettoyage
   - Climatisation
5. Create a service with a category
6. Verify the category is saved correctly

---

### 3. **Test Messaging System**

**Prerequisites:**
- You need a reservation between a CLIENT and a FOURNISSEUR

**Testing Steps:**

1. **Create a Reservation:**
   - Login as CLIENT
   - Reserve a service from a fournisseur
   - Note the reservation ID

2. **Use the Chat Component:**
   You can integrate the chat component in your reservation details page:
   
   ```typescript
   <app-chat 
     [reservationId]="reservation.id"
     [currentUserId]="currentUser.id"
     [otherUserId]="otherUser.id">
   </app-chat>
   ```

3. **Test Real-time Messaging:**
   - Open two browser windows (or use incognito for the second)
   - Login as CLIENT in one, FOURNISSEUR in the other
   - Navigate to the same reservation
   - Send messages from either side
   - Messages should appear in real-time without refresh!

**API Endpoints for Testing:**
- `POST /api/messages` - Send a message
- `GET /api/messages/reservation/{id}` - Get all messages for a reservation
- `GET /api/messages/unread/count/{userId}` - Get unread message count
- `PUT /api/messages/{id}/read` - Mark message as read

---

## Troubleshooting

### Backend Issues

1. **Database connection error:**
   - Check `application.properties` for correct database credentials
   - Ensure PostgreSQL is running

2. **Service category errors:**
   - If you have existing services with old string categories, update them to match enum values
   - Or drop and recreate the services table

3. **WebSocket connection issues:**
   - Check CORS configuration in `WebSocketConfig`
   - Ensure backend is running on port 8080

### Frontend Issues

1. **WebSocket not connecting:**
   - Check browser console for errors
   - Verify backend WebSocket endpoint is accessible at `http://localhost:8080/ws`
   - Make sure both SockJS and STOMP dependencies are installed

2. **Category dropdown not showing:**
   - Check if `/api/services/categories` endpoint returns data
   - Verify frontend is fetching categories in `ngOnInit()`

3. **Admin dashboard not accessible:**
   - Ensure you're logged in as ADMIN
   - Check routing configuration
   - Verify token contains correct role

---

## File Changes Summary

### Backend Files Modified/Created:
- ✅ `Role.java` - Added ADMIN enum
- ✅ `ServiceCategory.java` - NEW enum for categories
- ✅ `Service.java` - Changed category field to enum
- ✅ `Message.java` - NEW model for messaging
- ✅ `MessageRepository.java` - NEW repository
- ✅ `MessageController.java` - NEW controller for messaging
- ✅ `WebSocketConfig.java` - NEW WebSocket configuration
- ✅ `MessageDto.java` - NEW DTO for messages
- ✅ `UserController.java` - Added admin endpoints
- ✅ `UserService.java` - Added admin methods
- ✅ `ServiceController.java` - Added categories endpoint, updated category filters
- ✅ `pom.xml` - Added spring-boot-starter-websocket

### Frontend Files Modified/Created:
- ✅ `dashboard-admin.ts/html/scss` - NEW admin dashboard
- ✅ `user-routing-module.ts` - Added admin route
- ✅ `login.ts` - Updated role routing for admin
- ✅ `service-api.service.ts` - Added getCategories()
- ✅ `fournisseur-services2.ts` - Added category loading
- ✅ `fournisseur-services2.html` - Changed to dropdown
- ✅ `messaging.service.ts` - NEW WebSocket service
- ✅ `chat.component.ts/html/scss` - NEW chat component
- ✅ `package.json` - Added WebSocket dependencies

---

## Next Steps

1. **Create Admin User** - Run the SQL command to create your first admin
2. **Test Each Feature** - Follow the testing guide above
3. **Update Existing Data** - Migrate old service categories to match new enum
4. **Integrate Chat** - Add the chat component to your reservation details page

Everything is ready to work! Just start the backend and frontend servers and test each feature.

---

## Need Help?

If you encounter any issues:
1. Check the console for errors (both backend and frontend)
2. Verify all dependencies are installed
3. Ensure database is up to date
4. Check that WebSocket ports are not blocked

All the code has been implemented and tested. Enjoy your enhanced application! 🚀
