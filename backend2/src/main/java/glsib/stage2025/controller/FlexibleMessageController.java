package glsib.stage2025.controller;

import glsib.stage2025.dto.MessageDto;
import glsib.stage2025.dto.MessageResponseDto;
import glsib.stage2025.dto.UserContactDto;
import glsib.stage2025.model.Message;
import glsib.stage2025.model.Reservation;
import glsib.stage2025.model.User;
import glsib.stage2025.repository.MessageRepository;
import glsib.stage2025.repository.ReservationRepository;
import glsib.stage2025.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flexible-messages")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class FlexibleMessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get contacts for current user (clients can see fournisseurs and vice versa)
    @GetMapping("/contacts")
    public ResponseEntity<List<UserContactDto>> getUserContacts(Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Get all users except the current user
        List<User> allUsers = userRepository.findAll();
        List<User> contacts = allUsers.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        // Create contact DTOs with unread message counts
        List<UserContactDto> contactDtos = new ArrayList<>();
        for (User contact : contacts) {
            UserContactDto dto = new UserContactDto(
                    contact.getId(),
                    contact.getFirstName(),
                    contact.getLastName(),
                    contact.getEmail(),
                    contact.getRole().name()
            );

            // Count unread messages from this contact to current user
            try {
                System.out.println("Counting unread messages from contact " + contact.getId() + " to user " + currentUser.getId());
                Long unreadCount = messageRepository.countBySender_IdAndReceiver_IdAndIsReadFalse(
                        contact.getId(), currentUser.getId());
                System.out.println("Unread count: " + unreadCount);
                dto.setUnreadCount(unreadCount);
            } catch (Exception e) {
                System.err.println("Error counting unread messages: " + e.getMessage());
                e.printStackTrace();
                dto.setUnreadCount(0L); // Default to 0 if there's an error
            }

            contactDtos.add(dto);
        }

        return ResponseEntity.ok(contactDtos);
    }

    // Get messages between current user and another user
    @GetMapping("/conversation/{otherUserId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MessageResponseDto>> getConversationMessages(
            @PathVariable Long otherUserId,
            Authentication authentication) {
        try {
            System.out.println("Getting conversation messages for otherUserId: " + otherUserId);
            String userEmail = authentication.getName();
            System.out.println("Current user email: " + userEmail);
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            System.out.println("Current user ID: " + currentUser.getId());

            // Generate conversation ID
            long minId = Math.min(currentUser.getId(), otherUserId);
            long maxId = Math.max(currentUser.getId(), otherUserId);
            String conversationId = minId + "_" + maxId;
            System.out.println("Generated conversation ID: " + conversationId);

            List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
            System.out.println("Found " + messages.size() + " messages");

            // Mark messages as read if they are received by current user
            for (Message message : messages) {
                System.out.println("Processing message ID: " + message.getId());
                // Add null checks to prevent NullPointerException
                if (message.getReceiver() != null && 
                    message.getReceiver().getId() != null && 
                    message.getReceiver().getId().equals(currentUser.getId()) && 
                    !message.isRead()) {
                    System.out.println("Marking message as read");
                    message.setRead(true);
                    messageRepository.save(message);
                }
            }

            // Convert Message entities to MessageResponseDto
            List<MessageResponseDto> messageDtos = new ArrayList<>();
            for (Message message : messages) {
                String senderName = "Unknown";
                String receiverName = "Unknown";
                
                if (message.getSender() != null) {
                    senderName = message.getSender().getFirstName() != null ? 
                                message.getSender().getFirstName() : "";
                    if (message.getSender().getLastName() != null) {
                        senderName += " " + message.getSender().getLastName();
                    }
                    senderName = senderName.trim();
                    if (senderName.isEmpty()) senderName = "Unknown";
                }
                
                if (message.getReceiver() != null) {
                    receiverName = message.getReceiver().getFirstName() != null ? 
                                  message.getReceiver().getFirstName() : "";
                    if (message.getReceiver().getLastName() != null) {
                        receiverName += " " + message.getReceiver().getLastName();
                    }
                    receiverName = receiverName.trim();
                    if (receiverName.isEmpty()) receiverName = "Unknown";
                }
                
                MessageResponseDto dto = new MessageResponseDto(
                        message.getId(),
                        message.getSender() != null ? message.getSender().getId() : null,
                        senderName,
                        message.getReceiver() != null ? message.getReceiver().getId() : null,
                        receiverName,
                        message.getContent(),
                        message.getTimestamp(),
                        message.isRead(),
                        message.getConversationId()
                );
                messageDtos.add(dto);
            }
                    
            return ResponseEntity.ok(messageDtos);
        } catch (Exception e) {
            System.err.println("Error in getConversationMessages: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Send message to a specific user (not tied to reservation)
    @PostMapping("/send")
    @Transactional
    public ResponseEntity<MessageResponseDto> sendMessageToUser(@RequestBody(required = false) MessageDto messageDto, Authentication authentication) {
        try {
            // Log incoming request for debugging
            System.out.println("Received message request: " + messageDto);
            
            // Check if messageDto is null
            if (messageDto == null) {
                System.out.println("MessageDto is null");
                return ResponseEntity.badRequest().body(new MessageResponseDto());
            }
            
            // Validate input
            if (messageDto.getContent() == null || messageDto.getContent().trim().isEmpty()) {
                System.out.println("Message content validation failed");
                return ResponseEntity.badRequest().body(new MessageResponseDto());
            }
            
            if (messageDto.getReceiverId() == null) {
                System.out.println("Receiver ID validation failed");
                return ResponseEntity.badRequest().body(new MessageResponseDto());
            }
            
            String userEmail = authentication.getName();
            System.out.println("Authenticated user: " + userEmail);
            
            User sender = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            Optional<User> receiver = userRepository.findById(messageDto.getReceiverId());

            if (receiver.isEmpty()) {
                System.out.println("Receiver not found for ID: " + messageDto.getReceiverId());
                return ResponseEntity.badRequest().body(new MessageResponseDto());
            }

            // Create a special reservation for flexible messages
            Reservation flexibleReservation = createOrGetFlexibleReservation(sender, receiver.get());
            
            // Create message with the flexible reservation
            Message message = new Message(
                    flexibleReservation,
                    sender,
                    receiver.get(),
                    messageDto.getContent().trim()
            );
            
            // Log message details for debugging
            System.out.println("Creating message with reservation: " + message.getReservation().getId());
            System.out.println("Message details - Sender: " + message.getSender().getId() + ", Receiver: " + message.getReceiver().getId() + ", Content: " + message.getContent());

            System.out.println("Saving message: " + message);
            Message savedMessage = messageRepository.save(message);
            System.out.println("Message saved successfully with ID: " + savedMessage.getId());

            // Send via WebSocket
            messagingTemplate.convertAndSend(
                    "/topic/conversation/" + message.getConversationId(),
                    savedMessage
            );

            // Convert Message entity to MessageResponseDto
            String senderName = "Unknown";
            String receiverName = "Unknown";
            
            if (savedMessage.getSender() != null) {
                senderName = savedMessage.getSender().getFirstName() != null ? 
                            savedMessage.getSender().getFirstName() : "";
                if (savedMessage.getSender().getLastName() != null) {
                    senderName += " " + savedMessage.getSender().getLastName();
                }
                senderName = senderName.trim();
                if (senderName.isEmpty()) senderName = "Unknown";
            }
            
            if (savedMessage.getReceiver() != null) {
                receiverName = savedMessage.getReceiver().getFirstName() != null ? 
                              savedMessage.getReceiver().getFirstName() : "";
                if (savedMessage.getReceiver().getLastName() != null) {
                    receiverName += " " + savedMessage.getReceiver().getLastName();
                }
                receiverName = receiverName.trim();
                if (receiverName.isEmpty()) receiverName = "Unknown";
            }
            
            MessageResponseDto messageDtoResponse = new MessageResponseDto(
                    savedMessage.getId(),
                    savedMessage.getSender() != null ? savedMessage.getSender().getId() : null,
                    senderName,
                    savedMessage.getReceiver() != null ? savedMessage.getReceiver().getId() : null,
                    receiverName,
                    savedMessage.getContent(),
                    savedMessage.getTimestamp(),
                    savedMessage.isRead(),
                    savedMessage.getConversationId()
            );
            
            return ResponseEntity.ok(messageDtoResponse);
        } catch (Exception e) {
            System.err.println("Error in sendMessageToUser: " + e.getMessage());
            e.printStackTrace();
            MessageResponseDto errorDto = new MessageResponseDto();
            return ResponseEntity.badRequest().body(errorDto);
        }
    }

    /**
     * Create or get an existing flexible reservation between two users
     * @param client The client user
     * @param fournisseur The fournisseur user
     * @return Reservation object for flexible messaging
     */
    private Reservation createOrGetFlexibleReservation(User client, User fournisseur) {
        // For flexible messaging, we create a special reservation
        // First, check if a flexible reservation already exists between these users
        // For simplicity, we'll create a new one each time
        Reservation reservation = new Reservation();
        reservation.setClient(client);
        reservation.setFournisseur(fournisseur);
        reservation.setUser(client); // Keep the original user field for compatibility
        reservation.setService(null); // No specific service for flexible messaging
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setStatus("FLEXIBLE_MESSAGE"); // Special status for flexible messages
        reservation.setQuantity(0); // No quantity for flexible messaging
        
        // Save the reservation to satisfy the foreign key constraint
        reservation = reservationRepository.save(reservation);
        return reservation;
    }

    // Get unread message count for current user
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Long count = messageRepository.countByReceiver_IdAndIsReadFalse(currentUser.getId());
        return ResponseEntity.ok(count);
    }
}