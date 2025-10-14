
package glsib.stage2025.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"reservations", "reviews", "owner"})
    private Service service;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int rating;
    private String comment;
    private LocalDateTime reviewDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Service getService() { return service; }
    public void setService(Service service) { this.service = service; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDateTime reviewDate) { this.reviewDate = reviewDate; }
}