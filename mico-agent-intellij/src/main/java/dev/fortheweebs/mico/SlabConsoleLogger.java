package dev.fortheweebs.mico;

public class SlabConsoleLogger {

    private static SlabConsolePanel instance;

    public static void setInstance(SlabConsolePanel panel) {
        instance = panel;
    }

    public static void log(String message) {
        if (instance != null) {
            instance.log(message);
        }
    }

    public static void logError(String message) {
        if (instance != null) {
            instance.logError(message);
        }
    }

    public static void logSuccess(String message) {
        if (instance != null) {
            instance.logSuccess(message);
        }
    }
}
