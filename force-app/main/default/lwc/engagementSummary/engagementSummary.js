import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEngagementStats from '@salesforce/apex/EngagementController.getEngagementStats';

// Importar referencias de campos
import RELATED_OPP_FIELD from '@salesforce/schema/Engagement__c.Related_Opportunity__c';
import OPP_AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import ENGAGEMENT_NAME_FIELD from '@salesforce/schema/Engagement__c.Name';
import TASK_OBJECT from '@salesforce/schema/Task';

export default class EngagementSummary extends LightningElement {
    @api recordId; // Recibe el ID del Engagement actual
    
    relatedOppId;
    oppAmount;
    engagementName;
    completedTasks = 0;
    upcomingEvents = 0;

    // 1. LDS: Obtener el ID de la Oportunidad relacionada y el Nombre del Engagement
    @wire(getRecord, { recordId: '$recordId', fields:[RELATED_OPP_FIELD, ENGAGEMENT_NAME_FIELD] })
    wiredEngagement({ error, data }) {
        if (data) {
            this.relatedOppId = getFieldValue(data, RELATED_OPP_FIELD);
            this.engagementName = getFieldValue(data, ENGAGEMENT_NAME_FIELD);
        }
    }

    // 2. LDS: Si hay Oportunidad, obtener su Amount
    @wire(getRecord, { recordId: '$relatedOppId', fields: [OPP_AMOUNT_FIELD] })
    wiredOpportunity({ error, data }) {
        if (data) {
            this.oppAmount = getFieldValue(data, OPP_AMOUNT_FIELD);
        }
    }

    // 3. APEX: Obtener agregaciones
    @wire(getEngagementStats, { engagementId: '$recordId' })
    wiredStats({ error, data }) {
        if (data) {
            this.completedTasks = data.completedTasks;
            this.upcomingEvents = data.upcomingEvents;
        }
    }

    // 4. LDS: Crear Registro (Tarea) sin usar Apex
    handleQuickFollowUp() {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const fields = {
            Type: 'Call',
            ActivityDate: tomorrow.toISOString().split('T')[0], // Formato YYYY-MM-DD
            Subject: `Follow-up on ${this.engagementName}`,
            WhatId: this.recordId
        };

        const recordInput = { apiName: TASK_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Follow-Up Task created successfully!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error creating task',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }
}