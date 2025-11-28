package glsib.stage2025.model;

public enum ServiceCategory {
    PLOMBERIE("Plomberie"),
    ELECTRICITE("Électricité"),
    MENUISERIE("Menuiserie"),
    PEINTURE("Peinture"),
    MACONNERIE("Maçonnerie"),
    JARDINAGE("Jardinage"),
    NETTOYAGE("Nettoyage"),
    CLIMATISATION("Climatisation");

    private final String displayName;

    ServiceCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
