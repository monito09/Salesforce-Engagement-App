import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Importar métodos de Apex
import getEngagementStats from '@salesforce/apex/EngagementController.getEngagementStats';
import createFollowUpTask from '@salesforce/apex/EngagementController.createFollowUpTask';

// Importar referencias
import RELATED_OPP_FIELD from '@salesforce/schema/Engagement__c.Related_Opportunity__c';
import OPP_AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import ENGAGEMENT_NAME_FIELD from '@salesforce/schema/Engagement__c.Name';

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
        // Llamamos al método de Apex pasándole los parámetros
        createFollowUpTask({ 
            engagementId: this.recordId, 
            engagementName: this.engagementName 
        })
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