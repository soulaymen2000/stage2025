package glsib.stage2025.repository;

import glsib.stage2025.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReservation_IdOrderByTimestampAsc(Long reservationId);
    
    List<Message> findBySender_IdOrReceiver_IdOrderByTimestampDesc(Long senderId, Long receiverId);
    
    List<Message> findByReceiver_IdAndIsReadFalse(Long receiverId);
    
    Long countByReceiver_IdAndIsReadFalse(Long receiverId);
    
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
    
    Long countBySender_IdAndReceiver_IdAndIsReadFalse(Long senderId, Long receiverId);
}