public with sharing class EngagementController {
    
    // Clase Wrapper para enviar múltiples datos al LWC
    public class EngagementStats {
        @AuraEnabled public Integer completedTasks;
        @AuraEnabled public Integer upcomingEvents;
    }

    // 1. Método para CONTAR Tareas y Eventos (Llamado vía @wire en JS)
    @AuraEnabled(cacheable=true)
    public static EngagementStats getEngagementStats(Id engagementId) {
        EngagementStats stats = new EngagementStats();
        
        // Contar Tareas completadas relacionadas a este Engagement (WhatId)
        stats.completedTasks = [SELECT COUNT() FROM Task WHERE WhatId = :engagementId AND Status = 'Completed'];
        
        // Contar Eventos futuros (hoy en adelante)
        stats.upcomingEvents =[SELECT COUNT() FROM Event WHERE WhatId = :engagementId AND StartDateTime >= TODAY];
        
        return stats;
    }

    // 2. NUEVO MÉTODO: Crear la tarea desde el Backend (Llamado imperativamente en JS)
    @AuraEnabled
    public static Id createFollowUpTask(Id engagementId, String engagementName) {
        try {
            // Creamos una nueva instancia del objeto Task en memoria
            Task newTask = new Task(
                Type = 'Call',
                ActivityDate = Date.today().addDays(1), // Mañana
                Subject = 'Follow-up on ' + engagementName,
                WhatId = engagementId // Lo vinculamos al Engagement actual
            );
            
            // Insertamos (guardamos) el registro en la base de datos
            insert newTask; 
            
            // Devolvemos el ID de la tarea recién creada
            return newTask.Id;
            
        } catch (Exception e) {
            // Si hay un error (ej. permisos), lanzamos un error que el Frontend pueda entender
            throw new AuraHandledException(e.getMessage());
        }
    }
}