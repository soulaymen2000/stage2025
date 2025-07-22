package glsib.stage2025.dto;

import java.time.LocalDateTime;

public class ReservationDetailDto {
    private String reservationId;
    private String serviceName;
    private String clientName;
    private LocalDateTime reservationDate;
    private String status;
    private double price;

    public ReservationDetailDto(String reservationId, String serviceName, String clientName, LocalDateTime reservationDate, String status, double price) {
        this.reservationId = reservationId;
        this.serviceName = serviceName;
        this.clientName = clientName;
        this.reservationDate = reservationDate;
        this.status = status;
        this.price = price;
    }

    // Getters and Setters
    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public LocalDateTime getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDateTime reservationDate) {
        this.reservationDate = reservationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
} 