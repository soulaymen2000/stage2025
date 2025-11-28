package glsib.stage2025.dto;

public class MessageDto {
    private Long reservationId;
    private Long senderId;
    private Long receiverId;
    private String content;

    // Constructors
    public MessageDto() {}

    public MessageDto(Long reservationId, Long senderId, Long receiverId, String content) {
        this.reservationId = reservationId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
    }

    // Getters and Setters
    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
