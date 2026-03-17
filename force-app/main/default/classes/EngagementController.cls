public with sharing class EngagementController {
    
    public class EngagementStats {
        @AuraEnabled public Integer completedTasks;
        @AuraEnabled public Integer upcomingEvents;
    }

    @AuraEnabled(cacheable=true)
    public static EngagementStats getEngagementStats(Id engagementId) {
        EngagementStats stats = new EngagementStats();
        stats.completedTasks = [SELECT COUNT() FROM Task WHERE WhatId = :engagementId AND Status = 'Completed'];
        stats.upcomingEvents =[SELECT COUNT() FROM Event WHERE WhatId = :engagementId AND StartDateTime >= TODAY];
        return stats;
    }

    // --- NUEVO MÉTODO PARA CREAR LA TAREA ---
    @AuraEnabled
    public static void createFollowUpTask(Id engagementId, String engagementName) {
        try {
            // Calculamos la fecha de mañana
            Date tomorrow = Date.today().addDays(1);
            
            // Instanciamos la nueva tarea
            Task newTask = new Task(
                Type = 'Call',
                ActivityDate = tomorrow,
                Subject = 'Follow-up on ' + engagementName,
                WhatId = engagementId
            );
            
            // Insertamos en la Base de Datos
            insert newTask;
            
        } catch (Exception e) {
            // Manejo de errores que LWC pueda entender
            throw new AuraHandledException(e.getMessage());
        }
    }
}