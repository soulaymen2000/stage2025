package glsib.stage2025.dto;

public class StatsDto {
    private double totalRevenue;
    private long totalReservations;
    private double averageRating;

    public StatsDto(double totalRevenue, long totalReservations, double averageRating) {
        this.totalRevenue = totalRevenue;
        this.totalReservations = totalReservations;
        this.averageRating = averageRating;
    }

    // Getters and Setters
    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalReservations() {
        return totalReservations;
    }

    public void setTotalReservations(long totalReservations) {
        this.totalReservations = totalReservations;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
} 