package dev.fortheweebs.mico;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.project.Project;

public class RunSlabAction extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        Project project = e.getProject();
        if (project == null) {
            SlabConsoleLogger.logError("No active project found");
            return;
        }

        // Build context from project
        String context = "Project: " + project.getName() + ", Path: " + project.getBasePath();

        // Execute slab with streaming (async, non-blocking)
        AgentService service = AgentService.getInstance();
        service.runSlabStreaming(context)
                .exceptionally(throwable -> {
                    SlabConsoleLogger.logError("Unexpected error: " + throwable.getMessage());
                    return null;
                });

        // Action returns immediately, streaming happens in background
    }
}
