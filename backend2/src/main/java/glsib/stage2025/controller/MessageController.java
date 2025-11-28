package glsib.stage2025.controller;

import glsib.stage2025.dto.MessageDto;
import glsib.stage2025.model.Message;
import glsib.stage2025.model.Reservation;
import glsib.stage2025.model.User;
import glsib.stage2025.repository.MessageRepository;
import glsib.stage2025.repository.ReservationRepository;
import glsib.stage2025.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get all messages for a specific reservation
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<Message>> getMessagesByReservation(@PathVariable Long reservationId) {
        List<Message> messages = messageRepository.findByReservation_IdOrderByTimestampAsc(reservationId);
        return ResponseEntity.ok(messages);
    }

    // Send a message (REST endpoint)
    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDto messageDto) {
        try {
            Optional<Reservation> reservation = reservationRepository.findById(messageDto.getReservationId());
            Optional<User> sender = userRepository.findById(messageDto.getSenderId());
            Optional<User> receiver = userRepository.findById(messageDto.getReceiverId());

            if (reservation.isEmpty() || sender.isEmpty() || receiver.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid reservation, sender, or receiver ID");
            }

            Message message = new Message(
                    reservation.get(),
                    sender.get(),
                    receiver.get(),
                    messageDto.getContent()
            );

            Message savedMessage = messageRepository.save(message);

            // Send via WebSocket
            messagingTemplate.convertAndSend(
                    "/topic/reservation/" + messageDto.getReservationId(),
                    savedMessage
            );

            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }

    // WebSocket endpoint for real-time messaging
    @MessageMapping("/chat/{reservationId}")
    @SendTo("/topic/reservation/{reservationId}")
    public Message sendMessageViaWebSocket(MessageDto messageDto) {
        Optional<Reservation> reservation = reservationRepository.findById(messageDto.getReservationId());
        Optional<User> sender = userRepository.findById(messageDto.getSenderId());
        Optional<User> receiver = userRepository.findById(messageDto.getReceiverId());

        if (reservation.isEmpty() || sender.isEmpty() || receiver.isEmpty()) {
            throw new RuntimeException("Invalid reservation, sender, or receiver ID");
        }

        Message message = new Message(
                reservation.get(),
                sender.get(),
                receiver.get(),
                messageDto.getContent()
        );

        return messageRepository.save(message);
    }

    // Mark messages as read
    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setRead(true);
            messageRepository.save(message);
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.notFound().build();
    }

    // Get unread message count for a user
    @GetMapping("/unread/count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        Long count = messageRepository.countByReceiver_IdAndIsReadFalse(userId);
        return ResponseEntity.ok(count);
    }

    // Get all unread messages for a user
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable Long userId) {
        List<Message> messages = messageRepository.findByReceiver_IdAndIsReadFalse(userId);
        return ResponseEntity.ok(messages);
    }

    // Get messages between two users (conversation)
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<Message>> getConversationMessages(
            @PathVariable Long otherUserId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Generate conversation ID
        long minId = Math.min(currentUser.getId(), otherUserId);
        long maxId = Math.max(currentUser.getId(), otherUserId);
        String conversationId = minId + "_" + maxId;
        
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        return ResponseEntity.ok(messages);
    }

    // Send message to a specific user (not tied to reservation)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessageToUser(@RequestBody MessageDto messageDto, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User sender = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
            Optional<User> receiver = userRepository.findById(messageDto.getReceiverId());
            Optional<Reservation> reservation = Optional.empty();
            
            if (messageDto.getReservationId() != null) {
                reservation = reservationRepository.findById(messageDto.getReservationId());
            }

            if (receiver.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid receiver ID");
            }

            Message message = new Message(
                    reservation.orElse(null),
                    sender,
                    receiver.get(),
                    messageDto.getContent()
            );

            Message savedMessage = messageRepository.save(message);

            // Send via WebSocket
            messagingTemplate.convertAndSend(
                    "/topic/conversation/" + message.getConversationId(),
                    savedMessage
            );

            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }
}