import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEngagementStats from '@salesforce/apex/EngagementController.getEngagementStats';

// Importar referencias de campos de Engagement y Opportunity
import RELATED_OPP_FIELD from '@salesforce/schema/Engagement__c.Related_Opportunity__c';
import OPP_AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import ENGAGEMENT_NAME_FIELD from '@salesforce/schema/Engagement__c.Name';

// Importar referencias del objeto Task (ESTA ES LA SOLUCIÓN)
import TASK_OBJECT from '@salesforce/schema/Task';
import TASK_TYPE_FIELD from '@salesforce/schema/Task.Type';
import TASK_DATE_FIELD from '@salesforce/schema/Task.ActivityDate';
import TASK_SUBJECT_FIELD from '@salesforce/schema/Task.Subject';
import TASK_WHATID_FIELD from '@salesforce/schema/Task.WhatId';

export default class EngagementSummary extends LightningElement {
    @api recordId; 
    
    relatedOppId;
    oppAmount;
    engagementName;
    completedTasks = 0;
    upcomingEvents = 0;

    @wire(getRecord, { recordId: '$recordId', fields:[RELATED_OPP_FIELD, ENGAGEMENT_NAME_FIELD] })
    wiredEngagement({ error, data }) {
        if (data) {
            this.relatedOppId = getFieldValue(data, RELATED_OPP_FIELD);
            this.engagementName = getFieldValue(data, ENGAGEMENT_NAME_FIELD);
        }
    }

    @wire(getRecord, { recordId: '$relatedOppId', fields:[OPP_AMOUNT_FIELD] })
    wiredOpportunity({ error, data }) {
        if (data) {
            this.oppAmount = getFieldValue(data, OPP_AMOUNT_FIELD);
        }
    }

    @wire(getEngagementStats, { engagementId: '$recordId' })
    wiredStats({ error, data }) {
        if (data) {
            this.completedTasks = data.completedTasks;
            this.upcomingEvents = data.upcomingEvents;
        }
    }

    handleQuickFollowUp() {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Construir los campos usando los Schema Imports (Best Practice)
        const fields = {};
        fields[TASK_TYPE_FIELD.fieldApiName] = 'Call';
        fields[TASK_DATE_FIELD.fieldApiName] = tomorrow.toISOString().split('T')[0];
        fields[TASK_SUBJECT_FIELD.fieldApiName] = `Follow-up on ${this.engagementName}`;
        fields[TASK_WHATID_FIELD.fieldApiName] = this.recordId;

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
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                }));
            });
    }
}