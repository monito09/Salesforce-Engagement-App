public with sharing class EngagementController {
    
    public class EngagementStats {
        @AuraEnabled public Integer completedTasks;
        @AuraEnabled public Integer upcomingEvents;
    }

    @AuraEnabled(cacheable=true)
    public static EngagementStats getEngagementStats(Id engagementId) {
        EngagementStats stats = new EngagementStats();
        
        stats.completedTasks =[SELECT COUNT() FROM Task WHERE WhatId = :engagementId AND Status = 'Completed'];
        stats.upcomingEvents = [SELECT COUNT() FROM Event WHERE WhatId = :engagementId AND StartDateTime >= TODAY];
        
        return stats;
    }

    // NUEVO MÉTODO: Crear la tarea desde el Backend
    @AuraEnabled
    public static Id createFollowUpTask(Id engagementId, String engagementName) {
        try {
            Task newTask = new Task(
                Type = 'Call',
                ActivityDate = Date.today().addDays(1),
                Subject = 'Follow-up on ' + engagementName,
                WhatId = engagementId
            );
            insert newTask; // Guarda en la BD
            return newTask.Id;
        } catch (Exception e) {
            // Lanza el error al Frontend de forma segura
            throw new AuraHandledException(e.getMessage());
        }
    }
}