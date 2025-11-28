# Flexible Messaging System

This document explains how to use the new flexible messaging system that allows clients and fournisseurs to communicate directly without being tied to specific reservations.

## Features

1. **Direct Communication**: Clients and fournisseurs can communicate directly with each other
2. **Contact List**: Users can see a list of all other users in the system
3. **Real-time Messaging**: Messages are delivered in real-time using WebSocket
4. **Conversation History**: All messages between two users are stored and can be retrieved
5. **Unread Message Tracking**: System tracks unread messages for each user

## Backend API Endpoints

### Flexible Message Controller

Base URL: `http://localhost:1234/api/flexible-messages`

1. **Get User Contacts**
   - Endpoint: `GET /contacts`
   - Description: Get a list of all users except the current user
   - Response: Array of UserContactDto objects

2. **Get Conversation Messages**
   - Endpoint: `GET /conversation/{otherUserId}`
   - Description: Get all messages between current user and another user
   - Response: Array of Message objects

3. **Send Message**
   - Endpoint: `POST /send`
   - Description: Send a message to another user
   - Request Body: MessageDto object
   - Response: Saved Message object

4. **Get Unread Count**
   - Endpoint: `GET /unread/count`
   - Description: Get the number of unread messages for the current user
   - Response: Number of unread messages

## Frontend Components

### Contacts Component
- Displays a list of all users in the system
- Allows searching through contacts
- Shows unread message counts for each contact

### Conversation Component
- Displays messages between two users
- Allows sending new messages
- Supports real-time message updates via WebSocket

### Messaging Component
- Main messaging interface that combines contacts and conversation components
- Responsive design that works on mobile and desktop

## How to Use

1. **Access the Messaging Page**
   - Navigate to `/messaging` in your browser
   - You'll see a list of all users on the left panel

2. **Start a Conversation**
   - Click on any user in the contacts list
   - The conversation panel will open on the right
   - You can see the message history with that user

3. **Send Messages**
   - Type your message in the input field at the bottom of the conversation panel
   - Press Enter or click the Send button to send
   - Messages are delivered in real-time to the other user

4. **Real-time Updates**
   - When the other user sends you a message, it will appear immediately
   - Unread message counts are updated automatically

## Technical Implementation

### Backend
- **FlexibleMessageController**: Handles all flexible messaging API endpoints
- **UserContactDto**: Data transfer object for user contact information
- **MessageRepository**: Extended with methods for conversation-based queries
- **Message Entity**: Updated with a new constructor for messages without reservations

### Frontend
- **FlexibleMessagingService**: Service for handling all messaging API calls and WebSocket connections
- **ContactsComponent**: Component for displaying user contacts
- **ConversationComponent**: Component for displaying and sending messages
- **MessagingComponent**: Main component that combines contacts and conversation
- **MessagingModule**: Angular module for the messaging feature

## WebSocket Topics

- **Conversation Messages**: `/topic/conversation/{conversationId}`
  - Messages are sent to this topic for real-time delivery
  - Conversation ID is generated based on the user IDs (minId_maxId)

## Security

- All endpoints require authentication
- Users can only access conversations they are part of
- User roles (CLIENT, FOURNISSEUR) are respected in the contact list

## Future Improvements

1. **Message Search**: Add search functionality within conversations
2. **Message Attachments**: Allow sending files and images
3. **Message Reactions**: Add emoji reactions to messages
4. **Group Chats**: Implement group conversations
5. **Message Status**: Show delivery and read receipts