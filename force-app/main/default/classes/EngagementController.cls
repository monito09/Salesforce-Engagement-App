public with sharing class EngagementController {
    
    // Clase Wrapper para enviar múltiples datos al LWC
    public class EngagementStats {
        @AuraEnabled public Integer completedTasks;
        @AuraEnabled public Integer upcomingEvents;
    }

    @AuraEnabled(cacheable=true)
    public static EngagementStats getEngagementStats(Id engagementId) {
        EngagementStats stats = new EngagementStats();
        
        // Contar Tareas completadas relacionadas a este Engagement (WhatId)
        stats.completedTasks = [SELECT COUNT() FROM Task WHERE WhatId = :engagementId AND Status = 'Completed'];
        
        // Contar Eventos futuros (hoy en adelante)
        stats.upcomingEvents =[SELECT COUNT() FROM Event WHERE WhatId = :engagementId AND StartDateTime >= TODAY];
        
        return stats;
    }
}