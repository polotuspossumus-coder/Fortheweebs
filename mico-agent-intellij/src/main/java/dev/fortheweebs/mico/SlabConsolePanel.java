package dev.fortheweebs.mico;

import com.intellij.openapi.project.Project;
import com.intellij.ui.components.JBScrollPane;

import javax.swing.*;
import javax.swing.text.*;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.Date;

public class SlabConsolePanel extends JPanel {

    private final JTextPane consoleOutput;
    private final StyledDocument document;
    private final SimpleDateFormat timeFormat;

    // Color styles
    private Style normalStyle;
    private Style successStyle;
    private Style errorStyle;
    private Style timestampStyle;

    public SlabConsolePanel(Project project) {
        super(new BorderLayout());

        this.timeFormat = new SimpleDateFormat("HH:mm:ss");

        // Console output area with styled document support
        consoleOutput = new JTextPane();
        consoleOutput.setEditable(false);
        consoleOutput.setFont(new Font("Monospaced", Font.PLAIN, 12));
        consoleOutput.setBackground(new Color(43, 43, 43));
        document = consoleOutput.getStyledDocument();

        // Initialize color styles
        initStyles();

        JBScrollPane scrollPane = new JBScrollPane(consoleOutput);
        add(scrollPane, BorderLayout.CENTER);

        // Control panel
        JPanel controlPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton clearButton = new JButton("Clear");
        clearButton.addActionListener(e -> {
            try {
                document.remove(0, document.getLength());
            } catch (BadLocationException ex) {
                // Ignore
            }
        });
        controlPanel.add(clearButton);
        add(controlPanel, BorderLayout.NORTH);

        // Register this panel as the singleton instance
        SlabConsoleLogger.setInstance(this);

        log("Mico Agent console initialized");
        log("Backend: " + AgentService.BACKEND_URL);
        log("Press Ctrl+Enter in editor to execute slabs\n");
    }

    private void initStyles() {
        // Normal style (default gray)
        normalStyle = document.addStyle("Normal", null);
        StyleConstants.setForeground(normalStyle, new Color(169, 183, 198));

        // Success style (green)
        successStyle = document.addStyle("Success", null);
        StyleConstants.setForeground(successStyle, new Color(98, 209, 150));
        StyleConstants.setBold(successStyle, true);

        // Error style (red)
        errorStyle = document.addStyle("Error", null);
        StyleConstants.setForeground(errorStyle, new Color(255, 107, 107));
        StyleConstants.setBold(errorStyle, true);

        // Timestamp style (dim gray)
        timestampStyle = document.addStyle("Timestamp", null);
        StyleConstants.setForeground(timestampStyle, new Color(128, 128, 128));
    }

    public void log(String message) {
        appendColoredText(message, normalStyle);
    }

    public void logError(String message) {
        appendColoredText("ERROR: " + message, errorStyle);
    }

    public void logSuccess(String message) {
        appendColoredText("SUCCESS: " + message, successStyle);
    }

    private void appendColoredText(String message, Style style) {
        SwingUtilities.invokeLater(() -> {
            try {
                String timestamp = timeFormat.format(new Date());

                // Append timestamp in dim gray
                document.insertString(document.getLength(), "[" + timestamp + "] ", timestampStyle);

                // Append message in the specified style
                document.insertString(document.getLength(), message + "\n", style);

                // Auto-scroll to bottom
                consoleOutput.setCaretPosition(document.getLength());

            } catch (BadLocationException e) {
                // Ignore
            }
        });
    }
}
