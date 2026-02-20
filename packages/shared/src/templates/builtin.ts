import type { TemplateFormSchema, TemplateCategory } from '../types/index.js';

export interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  formSchema: TemplateFormSchema;
  bpmnXml: string;
}

/**
 * Payroll Processing template — a common starting point for consulting engagements.
 * Uses placeholder variables for client-specific customization.
 */
export const payrollProcessingTemplate: BuiltinTemplate = {
  id: 'tpl-payroll-processing',
  name: 'Payroll Processing',
  description:
    'End-to-end payroll cycle from timesheet collection through payment disbursement and reporting.',
  category: 'payroll',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'hr_team_name',
        label: 'HR Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Human Resources',
      },
      {
        key: 'finance_team_name',
        label: 'Finance Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Finance Department',
      },
      {
        key: 'payroll_provider',
        label: 'Payroll Provider',
        type: 'text',
        required: false,
        placeholder: 'ADP / Gusto / Paychex',
      },
      {
        key: 'pay_frequency',
        label: 'Pay Frequency',
        type: 'select',
        required: true,
        options: [
          { label: 'Weekly', value: 'Weekly' },
          { label: 'Bi-weekly', value: 'Bi-weekly' },
          { label: 'Semi-monthly', value: 'Semi-monthly' },
          { label: 'Monthly', value: 'Monthly' },
        ],
        defaultValue: 'Bi-weekly',
      },
    ],
    lanes: [
      { placeholder: 'hr_team_name', label: 'HR Team', defaultValue: 'Human Resources' },
      { placeholder: 'finance_team_name', label: 'Finance Team', defaultValue: 'Finance Department' },
      { placeholder: 'management_name', label: 'Management', defaultValue: 'Management' },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  id="Definitions_payroll" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} Payroll Process" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_HR" name="{{hr_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_CollectTimesheets</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_VerifyAttendance</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Finance" name="{{finance_team_name}}">
        <bpmn:flowNodeRef>Task_CalculatePay</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ProcessDeductions</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_RunPayroll</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Mgmt" name="{{management_name}}">
        <bpmn:flowNodeRef>Task_ReviewApprove</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Approved</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_DisbursePayments</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="{{pay_frequency}} Payroll Cycle Begins">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_CollectTimesheets" name="Collect Timesheets &amp; Hours">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_VerifyAttendance" name="Verify Attendance Records">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_CalculatePay" name="Calculate Gross Pay">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_ProcessDeductions" name="Process Tax &amp; Deductions">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_RunPayroll" name="Run {{pay_frequency}} Payroll">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_ReviewApprove" name="Review &amp; Approve Payroll">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:incoming>Flow_Rework</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Approved" name="Approved?">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_Yes</bpmn:outgoing>
      <bpmn:outgoing>Flow_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_DisbursePayments" name="Disburse Payments">
      <bpmn:incoming>Flow_Yes</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EndEvent_1" name="Payroll Complete">
      <bpmn:incoming>Flow_End</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_CollectTimesheets" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_CollectTimesheets" targetRef="Task_VerifyAttendance" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_VerifyAttendance" targetRef="Task_CalculatePay" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_CalculatePay" targetRef="Task_ProcessDeductions" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_ProcessDeductions" targetRef="Task_RunPayroll" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_RunPayroll" targetRef="Task_ReviewApprove" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_ReviewApprove" targetRef="Gateway_Approved" />
    <bpmn:sequenceFlow id="Flow_Yes" name="Yes" sourceRef="Gateway_Approved" targetRef="Task_DisbursePayments" />
    <bpmn:sequenceFlow id="Flow_Rework" name="Needs Rework" sourceRef="Gateway_Approved" targetRef="Task_ReviewApprove" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_DisbursePayments" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
};

/**
 * Accounts Payable template
 */
export const accountsPayableTemplate: BuiltinTemplate = {
  id: 'tpl-accounts-payable',
  name: 'Accounts Payable',
  description:
    'Invoice receipt through payment processing, including approval workflows and three-way matching.',
  category: 'accounts-payable',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'ap_team_name',
        label: 'AP Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Accounts Payable',
      },
      {
        key: 'purchasing_team_name',
        label: 'Purchasing Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Purchasing',
      },
      {
        key: 'approval_threshold',
        label: 'Approval Threshold ($)',
        type: 'number',
        required: false,
        defaultValue: '5000',
      },
    ],
    lanes: [
      { placeholder: 'ap_team_name', label: 'AP Team', defaultValue: 'Accounts Payable' },
      { placeholder: 'purchasing_team_name', label: 'Purchasing', defaultValue: 'Purchasing' },
      { placeholder: 'management_name', label: 'Management', defaultValue: 'Management' },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  id="Definitions_ap" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} Accounts Payable" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_AP" name="{{ap_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ReceiveInvoice</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ThreeWayMatch</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Match</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_SchedulePayment</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ProcessPayment</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Purchasing" name="{{purchasing_team_name}}">
        <bpmn:flowNodeRef>Task_ResolveDiscrepancy</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Mgmt" name="{{management_name}}">
        <bpmn:flowNodeRef>Task_ApprovePayment</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="Invoice Received">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_ReceiveInvoice" name="Log &amp; Code Invoice">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_ThreeWayMatch" name="Three-Way Match (PO, Receipt, Invoice)">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_Match" name="Match OK?">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_MatchYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_MatchNo</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_ResolveDiscrepancy" name="Resolve Discrepancy">
      <bpmn:incoming>Flow_MatchNo</bpmn:incoming>
      <bpmn:outgoing>Flow_Resolved</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ApprovePayment" name="Approve Payment (Over \${{approval_threshold}})">
      <bpmn:incoming>Flow_MatchYes</bpmn:incoming>
      <bpmn:incoming>Flow_Resolved</bpmn:incoming>
      <bpmn:outgoing>Flow_Approved</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_SchedulePayment" name="Schedule Payment">
      <bpmn:incoming>Flow_Approved</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_ProcessPayment" name="Process Payment">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EndEvent_1" name="Invoice Paid">
      <bpmn:incoming>Flow_End</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_ReceiveInvoice" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_ReceiveInvoice" targetRef="Task_ThreeWayMatch" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_ThreeWayMatch" targetRef="Gateway_Match" />
    <bpmn:sequenceFlow id="Flow_MatchYes" name="Yes" sourceRef="Gateway_Match" targetRef="Task_ApprovePayment" />
    <bpmn:sequenceFlow id="Flow_MatchNo" name="No" sourceRef="Gateway_Match" targetRef="Task_ResolveDiscrepancy" />
    <bpmn:sequenceFlow id="Flow_Resolved" sourceRef="Task_ResolveDiscrepancy" targetRef="Task_ApprovePayment" />
    <bpmn:sequenceFlow id="Flow_Approved" sourceRef="Task_ApprovePayment" targetRef="Task_SchedulePayment" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_SchedulePayment" targetRef="Task_ProcessPayment" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_ProcessPayment" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
};

/**
 * Month-End Close template
 */
export const monthEndCloseTemplate: BuiltinTemplate = {
  id: 'tpl-month-end-close',
  name: 'Month-End Close',
  description:
    'Complete month-end financial close checklist from sub-ledger reconciliation through final reporting.',
  category: 'financial-close',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'accounting_team_name',
        label: 'Accounting Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Accounting',
      },
      {
        key: 'controller_title',
        label: 'Controller / Reviewer Title',
        type: 'text',
        required: true,
        defaultValue: 'Controller',
      },
      {
        key: 'close_day_target',
        label: 'Target Close Day (business days)',
        type: 'number',
        required: false,
        defaultValue: '5',
      },
    ],
    lanes: [
      { placeholder: 'accounting_team_name', label: 'Accounting Team', defaultValue: 'Accounting' },
      { placeholder: 'controller_title', label: 'Controller', defaultValue: 'Controller' },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  id="Definitions_mec" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} Month-End Close" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Acct" name="{{accounting_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ReconcileSubledgers</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PostAdjustments</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ReconcileBank</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_AccrueExpenses</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PrepareTrialBalance</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Controller" name="{{controller_title}}">
        <bpmn:flowNodeRef>Task_ReviewTrialBalance</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Approved</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_GenerateReports</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ClosePeriod</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="Period End Reached">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_ReconcileSubledgers" name="Reconcile Sub-Ledgers">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_PostAdjustments" name="Post Adjusting Journal Entries">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ReconcileBank" name="Reconcile Bank Statements">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_AccrueExpenses" name="Accrue Expenses &amp; Revenue">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_PrepareTrialBalance" name="Prepare Trial Balance">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:incoming>Flow_Rework</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ReviewTrialBalance" name="Review Trial Balance">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Approved" name="Approved?">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_Yes</bpmn:outgoing>
      <bpmn:outgoing>Flow_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_GenerateReports" name="Generate Financial Reports">
      <bpmn:incoming>Flow_Yes</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_ClosePeriod" name="Close Period (Day {{close_day_target}})">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Month Closed">
      <bpmn:incoming>Flow_End</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_ReconcileSubledgers" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_ReconcileSubledgers" targetRef="Task_PostAdjustments" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_PostAdjustments" targetRef="Task_ReconcileBank" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_ReconcileBank" targetRef="Task_AccrueExpenses" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_AccrueExpenses" targetRef="Task_PrepareTrialBalance" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_PrepareTrialBalance" targetRef="Task_ReviewTrialBalance" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_ReviewTrialBalance" targetRef="Gateway_Approved" />
    <bpmn:sequenceFlow id="Flow_Yes" name="Yes" sourceRef="Gateway_Approved" targetRef="Task_GenerateReports" />
    <bpmn:sequenceFlow id="Flow_Rework" name="Corrections Needed" sourceRef="Gateway_Approved" targetRef="Task_PrepareTrialBalance" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_GenerateReports" targetRef="Task_ClosePeriod" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_ClosePeriod" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
};

/**
 * Accounts Receivable template — invoice generation through payment collection,
 * aging reports, and write-offs.
 */
export const accountsReceivableTemplate: BuiltinTemplate = {
  id: 'tpl-accounts-receivable',
  name: 'Accounts Receivable',
  description:
    'Invoice generation through payment collection, including aging reports, dunning, and write-offs.',
  category: 'accounts-receivable',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'ar_team_name',
        label: 'AR Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Accounts Receivable',
      },
      {
        key: 'sales_team_name',
        label: 'Sales Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Sales',
      },
      {
        key: 'finance_team_name',
        label: 'Finance Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Finance',
      },
      {
        key: 'payment_terms',
        label: 'Default Payment Terms',
        type: 'select',
        required: true,
        options: [
          { label: 'Net 15', value: 'Net 15' },
          { label: 'Net 30', value: 'Net 30' },
          { label: 'Net 45', value: 'Net 45' },
          { label: 'Net 60', value: 'Net 60' },
        ],
        defaultValue: 'Net 30',
      },
      {
        key: 'aging_threshold_days',
        label: 'Aging Threshold (days)',
        type: 'number',
        required: false,
        defaultValue: '90',
      },
    ],
    lanes: [
      { placeholder: 'sales_team_name', label: 'Sales Team', defaultValue: 'Sales' },
      { placeholder: 'ar_team_name', label: 'AR Team', defaultValue: 'Accounts Receivable' },
      { placeholder: 'finance_team_name', label: 'Finance Team', defaultValue: 'Finance' },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  id="Definitions_ar" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} Accounts Receivable" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Sales" name="{{sales_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_CreateInvoice</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_AR" name="{{ar_team_name}}">
        <bpmn:flowNodeRef>Task_SendInvoice</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_TrackPayment</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_PaymentReceived</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ApplyCash</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_SendDunning</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_PastThreshold</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Escalate</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Finance" name="{{finance_team_name}}">
        <bpmn:flowNodeRef>Task_RunAgingReport</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ReviewWriteOff</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PostWriteOff</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="Customer Order Fulfilled">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_CreateInvoice" name="Generate Invoice ({{payment_terms}})">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_SendInvoice" name="Send Invoice to Customer">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_TrackPayment" name="Monitor Payment Status">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:incoming>Flow_DunningLoop</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_PaymentReceived" name="Payment Received?">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_PaidYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_PaidNo</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_ApplyCash" name="Apply Cash &amp; Reconcile">
      <bpmn:incoming>Flow_PaidYes</bpmn:incoming>
      <bpmn:outgoing>Flow_ToAging</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_SendDunning" name="Send Dunning Notice">
      <bpmn:incoming>Flow_PaidNo</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_PastThreshold" name="Past {{aging_threshold_days}} Days?">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_DunningLoop</bpmn:outgoing>
      <bpmn:outgoing>Flow_ToEscalate</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_Escalate" name="Escalate to Collections">
      <bpmn:incoming>Flow_ToEscalate</bpmn:incoming>
      <bpmn:outgoing>Flow_ToWriteOff</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_RunAgingReport" name="Generate Aging Report">
      <bpmn:incoming>Flow_ToAging</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_ReviewWriteOff" name="Review for Write-Off">
      <bpmn:incoming>Flow_ToWriteOff</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_PostWriteOff" name="Post Write-Off Entry">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_End2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EndEvent_1" name="AR Cycle Complete">
      <bpmn:incoming>Flow_End</bpmn:incoming>
      <bpmn:incoming>Flow_End2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_CreateInvoice" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_CreateInvoice" targetRef="Task_SendInvoice" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_SendInvoice" targetRef="Task_TrackPayment" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_TrackPayment" targetRef="Gateway_PaymentReceived" />
    <bpmn:sequenceFlow id="Flow_PaidYes" name="Yes" sourceRef="Gateway_PaymentReceived" targetRef="Task_ApplyCash" />
    <bpmn:sequenceFlow id="Flow_PaidNo" name="No" sourceRef="Gateway_PaymentReceived" targetRef="Task_SendDunning" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_SendDunning" targetRef="Gateway_PastThreshold" />
    <bpmn:sequenceFlow id="Flow_DunningLoop" name="No — Retry" sourceRef="Gateway_PastThreshold" targetRef="Task_TrackPayment" />
    <bpmn:sequenceFlow id="Flow_ToEscalate" name="Yes — Escalate" sourceRef="Gateway_PastThreshold" targetRef="Task_Escalate" />
    <bpmn:sequenceFlow id="Flow_ToAging" sourceRef="Task_ApplyCash" targetRef="Task_RunAgingReport" />
    <bpmn:sequenceFlow id="Flow_ToWriteOff" sourceRef="Task_Escalate" targetRef="Task_ReviewWriteOff" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_ReviewWriteOff" targetRef="Task_PostWriteOff" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_RunAgingReport" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_End2" sourceRef="Task_PostWriteOff" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
};

/**
 * Inventory Procure-to-Pay template — purchase requisition through goods receipt,
 * covering vendor selection, purchase orders, and receiving.
 */
export const inventoryProcureToPayTemplate: BuiltinTemplate = {
  id: 'tpl-inventory-procure-to-pay',
  name: 'Inventory Procure-to-Pay',
  description:
    'Purchase requisition through goods receipt, covering vendor selection, purchase orders, and three-way receiving.',
  category: 'procurement',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'requester_team_name',
        label: 'Requesting Department',
        type: 'text',
        required: true,
        defaultValue: 'Operations',
      },
      {
        key: 'procurement_team_name',
        label: 'Procurement Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Procurement',
      },
      {
        key: 'warehouse_team_name',
        label: 'Warehouse / Receiving Team',
        type: 'text',
        required: true,
        defaultValue: 'Warehouse',
      },
      {
        key: 'po_approval_limit',
        label: 'PO Approval Limit (\$)',
        type: 'number',
        required: false,
        defaultValue: '10000',
      },
      {
        key: 'erp_system',
        label: 'ERP System',
        type: 'text',
        required: false,
        placeholder: 'SAP / Oracle / NetSuite',
      },
    ],
    lanes: [
      { placeholder: 'requester_team_name', label: 'Requesting Dept', defaultValue: 'Operations' },
      { placeholder: 'procurement_team_name', label: 'Procurement', defaultValue: 'Procurement' },
      { placeholder: 'warehouse_team_name', label: 'Warehouse', defaultValue: 'Warehouse' },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  id="Definitions_p2p" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} Procure-to-Pay" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Requester" name="{{requester_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_CreateRequisition</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Procurement" name="{{procurement_team_name}}">
        <bpmn:flowNodeRef>Task_ReviewRequisition</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ReqApproved</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_SelectVendor</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_NegotiateTerms</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_IssuePO</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ReturnRequisition</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Warehouse" name="{{warehouse_team_name}}">
        <bpmn:flowNodeRef>Task_ReceiveGoods</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_InspectQuality</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_QualityOK</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_UpdateInventory</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_RejectGoods</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_Rejected</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="Material Need Identified">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_CreateRequisition" name="Create Purchase Requisition">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ReviewRequisition" name="Review Requisition (Over \${{po_approval_limit}})">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_ReqApproved" name="Requisition Approved?">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_ApprYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_ApprNo</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_ReturnRequisition" name="Return to Requester">
      <bpmn:incoming>Flow_ApprNo</bpmn:incoming>
      <bpmn:outgoing>Flow_ReturnEnd</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_SelectVendor" name="Evaluate &amp; Select Vendor">
      <bpmn:incoming>Flow_ApprYes</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_NegotiateTerms" name="Negotiate Terms &amp; Pricing">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_IssuePO" name="Issue Purchase Order">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_ReceiveGoods" name="Receive Goods at Dock">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_InspectQuality" name="Inspect Quality &amp; Quantity">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_QualityOK" name="Quality Acceptable?">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_QualYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_QualNo</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_UpdateInventory" name="Update Inventory in {{erp_system}}">
      <bpmn:incoming>Flow_QualYes</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_RejectGoods" name="Reject &amp; Return to Vendor">
      <bpmn:incoming>Flow_QualNo</bpmn:incoming>
      <bpmn:outgoing>Flow_EndRejected</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Goods Received &amp; Stocked">
      <bpmn:incoming>Flow_End</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_Rejected" name="Goods Returned to Vendor">
      <bpmn:incoming>Flow_EndRejected</bpmn:incoming>
      <bpmn:incoming>Flow_ReturnEnd</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_CreateRequisition" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_CreateRequisition" targetRef="Task_ReviewRequisition" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_ReviewRequisition" targetRef="Gateway_ReqApproved" />
    <bpmn:sequenceFlow id="Flow_ApprYes" name="Yes" sourceRef="Gateway_ReqApproved" targetRef="Task_SelectVendor" />
    <bpmn:sequenceFlow id="Flow_ApprNo" name="No" sourceRef="Gateway_ReqApproved" targetRef="Task_ReturnRequisition" />
    <bpmn:sequenceFlow id="Flow_ReturnEnd" sourceRef="Task_ReturnRequisition" targetRef="EndEvent_Rejected" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_SelectVendor" targetRef="Task_NegotiateTerms" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_NegotiateTerms" targetRef="Task_IssuePO" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_IssuePO" targetRef="Task_ReceiveGoods" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_ReceiveGoods" targetRef="Task_InspectQuality" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_InspectQuality" targetRef="Gateway_QualityOK" />
    <bpmn:sequenceFlow id="Flow_QualYes" name="Yes" sourceRef="Gateway_QualityOK" targetRef="Task_UpdateInventory" />
    <bpmn:sequenceFlow id="Flow_QualNo" name="No" sourceRef="Gateway_QualityOK" targetRef="Task_RejectGoods" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_UpdateInventory" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_EndRejected" sourceRef="Task_RejectGoods" targetRef="EndEvent_Rejected" />
  </bpmn:process>
</bpmn:definitions>`,
};

/**
 * Revenue Recognition template — contract review through revenue scheduling
 * per ASC 606 (five-step model).
 */
export const revenueRecognitionTemplate: BuiltinTemplate = {
  id: 'tpl-revenue-recognition',
  name: 'Revenue Recognition',
  description:
    'Contract review through revenue scheduling per ASC 606, including performance obligation identification and transaction price allocation.',
  category: 'revenue-recognition',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'sales_ops_team_name',
        label: 'Sales Operations Team',
        type: 'text',
        required: true,
        defaultValue: 'Sales Operations',
      },
      {
        key: 'revenue_accounting_team_name',
        label: 'Revenue Accounting Team',
        type: 'text',
        required: true,
        defaultValue: 'Revenue Accounting',
      },
      {
        key: 'controller_title',
        label: 'Controller / Approver Title',
        type: 'text',
        required: true,
        defaultValue: 'Controller',
      },
      {
        key: 'revenue_standard',
        label: 'Revenue Standard',
        type: 'select',
        required: true,
        options: [
          { label: 'ASC 606', value: 'ASC 606' },
          { label: 'IFRS 15', value: 'IFRS 15' },
        ],
        defaultValue: 'ASC 606',
      },
      {
        key: 'erp_system',
        label: 'ERP / Revenue System',
        type: 'text',
        required: false,
        placeholder: 'NetSuite / SAP RAR / Zuora',
      },
    ],
    lanes: [
      { placeholder: 'sales_ops_team_name', label: 'Sales Ops', defaultValue: 'Sales Operations' },
      {
        placeholder: 'revenue_accounting_team_name',
        label: 'Revenue Accounting',
        defaultValue: 'Revenue Accounting',
      },
      { placeholder: 'controller_title', label: 'Controller', defaultValue: 'Controller' },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  id="Definitions_revrec" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} Revenue Recognition ({{revenue_standard}})" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_SalesOps" name="{{sales_ops_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ReviewContract</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_IdentifyObligations</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_RevAcct" name="{{revenue_accounting_team_name}}">
        <bpmn:flowNodeRef>Task_DeterminePrice</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_AllocatePrice</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_RecognitionTiming</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_RecognizePointInTime</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_RecognizeOverTime</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_CreateSchedule</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PostJournalEntries</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Controller" name="{{controller_title}}">
        <bpmn:flowNodeRef>Task_ReviewSchedule</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Approved</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_FinalizeRevenue</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="New Contract Executed">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_ReviewContract" name="Review Contract Terms">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_IdentifyObligations" name="Identify Performance Obligations">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_DeterminePrice" name="Determine Transaction Price">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_AllocatePrice" name="Allocate Price to Obligations">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_RecognitionTiming" name="Recognition Timing?">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_PointInTime</bpmn:outgoing>
      <bpmn:outgoing>Flow_OverTime</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_RecognizePointInTime" name="Recognize at Point in Time">
      <bpmn:incoming>Flow_PointInTime</bpmn:incoming>
      <bpmn:outgoing>Flow_MergeA</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_RecognizeOverTime" name="Recognize Over Time (% Complete)">
      <bpmn:incoming>Flow_OverTime</bpmn:incoming>
      <bpmn:outgoing>Flow_MergeB</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_CreateSchedule" name="Create Revenue Schedule in {{erp_system}}">
      <bpmn:incoming>Flow_MergeA</bpmn:incoming>
      <bpmn:incoming>Flow_MergeB</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_PostJournalEntries" name="Post Journal Entries">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:incoming>Flow_Rework</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_ReviewSchedule" name="Review Revenue Schedule &amp; Entries">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Approved" name="Approved?">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_ApprYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_FinalizeRevenue" name="Finalize {{revenue_standard}} Disclosure">
      <bpmn:incoming>Flow_ApprYes</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Revenue Recognized">
      <bpmn:incoming>Flow_End</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_ReviewContract" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_ReviewContract" targetRef="Task_IdentifyObligations" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_IdentifyObligations" targetRef="Task_DeterminePrice" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_DeterminePrice" targetRef="Task_AllocatePrice" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_AllocatePrice" targetRef="Gateway_RecognitionTiming" />
    <bpmn:sequenceFlow id="Flow_PointInTime" name="Point in Time" sourceRef="Gateway_RecognitionTiming" targetRef="Task_RecognizePointInTime" />
    <bpmn:sequenceFlow id="Flow_OverTime" name="Over Time" sourceRef="Gateway_RecognitionTiming" targetRef="Task_RecognizeOverTime" />
    <bpmn:sequenceFlow id="Flow_MergeA" sourceRef="Task_RecognizePointInTime" targetRef="Task_CreateSchedule" />
    <bpmn:sequenceFlow id="Flow_MergeB" sourceRef="Task_RecognizeOverTime" targetRef="Task_CreateSchedule" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_CreateSchedule" targetRef="Task_PostJournalEntries" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_PostJournalEntries" targetRef="Task_ReviewSchedule" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_ReviewSchedule" targetRef="Gateway_Approved" />
    <bpmn:sequenceFlow id="Flow_ApprYes" name="Yes" sourceRef="Gateway_Approved" targetRef="Task_FinalizeRevenue" />
    <bpmn:sequenceFlow id="Flow_Rework" name="Adjustments Needed" sourceRef="Gateway_Approved" targetRef="Task_PostJournalEntries" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_FinalizeRevenue" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
};

/**
 * Compliance Audit template — audit planning, fieldwork, findings,
 * remediation, and reporting.
 */
export const complianceAuditTemplate: BuiltinTemplate = {
  id: 'tpl-compliance-audit',
  name: 'Compliance Audit',
  description:
    'End-to-end compliance audit lifecycle from planning and scoping through fieldwork, findings, remediation tracking, and final reporting.',
  category: 'compliance',
  formSchema: {
    fields: [
      {
        key: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        key: 'audit_team_name',
        label: 'Audit Team Name',
        type: 'text',
        required: true,
        defaultValue: 'Internal Audit',
      },
      {
        key: 'business_unit_name',
        label: 'Business Unit Under Audit',
        type: 'text',
        required: true,
        defaultValue: 'Business Unit',
      },
      {
        key: 'compliance_officer_title',
        label: 'Compliance Officer Title',
        type: 'text',
        required: true,
        defaultValue: 'Chief Compliance Officer',
      },
      {
        key: 'audit_framework',
        label: 'Audit Framework',
        type: 'select',
        required: true,
        options: [
          { label: 'SOX (Sarbanes-Oxley)', value: 'SOX' },
          { label: 'SOC 2', value: 'SOC 2' },
          { label: 'ISO 27001', value: 'ISO 27001' },
          { label: 'GDPR', value: 'GDPR' },
          { label: 'HIPAA', value: 'HIPAA' },
          { label: 'Custom Framework', value: 'Custom' },
        ],
        defaultValue: 'SOX',
      },
      {
        key: 'audit_period',
        label: 'Audit Period',
        type: 'text',
        required: false,
        placeholder: 'Q1 2026 / FY 2025',
      },
    ],
    lanes: [
      { placeholder: 'audit_team_name', label: 'Audit Team', defaultValue: 'Internal Audit' },
      {
        placeholder: 'business_unit_name',
        label: 'Business Unit',
        defaultValue: 'Business Unit',
      },
      {
        placeholder: 'compliance_officer_title',
        label: 'Compliance Officer',
        defaultValue: 'Chief Compliance Officer',
      },
    ],
  },
  bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  id="Definitions_audit" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="{{company_name}} {{audit_framework}} Compliance Audit" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Audit" name="{{audit_team_name}}">
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_DefineScope</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_CreateAuditPlan</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ConductFieldwork</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_TestControls</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_DocumentFindings</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_FindingsSeverity</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_DraftReport</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BU" name="{{business_unit_name}}">
        <bpmn:flowNodeRef>Task_ProvideEvidence</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_DevelopRemediation</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ImplementRemediation</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CCO" name="{{compliance_officer_title}}">
        <bpmn:flowNodeRef>Task_ReviewReport</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ReportApproved</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_IssueReport</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_TrackRemediation</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="{{audit_framework}} Audit Initiated ({{audit_period}})">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_DefineScope" name="Define Audit Scope &amp; Objectives">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_CreateAuditPlan" name="Create Audit Plan &amp; Timeline">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ProvideEvidence" name="Provide Evidence &amp; Documentation">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ConductFieldwork" name="Conduct Fieldwork &amp; Interviews">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_TestControls" name="Test Controls &amp; Procedures">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_DocumentFindings" name="Document Findings &amp; Exceptions">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_FindingsSeverity" name="Critical Findings?">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_Critical</bpmn:outgoing>
      <bpmn:outgoing>Flow_NoCritical</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_DevelopRemediation" name="Develop Remediation Plan">
      <bpmn:incoming>Flow_Critical</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ImplementRemediation" name="Implement Remediation Actions">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_DraftReport" name="Draft Audit Report">
      <bpmn:incoming>Flow_NoCritical</bpmn:incoming>
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_ReviewReport" name="Review Audit Report">
      <bpmn:incoming>Flow_10</bpmn:incoming>
      <bpmn:incoming>Flow_Revise</bpmn:incoming>
      <bpmn:outgoing>Flow_11</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_ReportApproved" name="Report Approved?">
      <bpmn:incoming>Flow_11</bpmn:incoming>
      <bpmn:outgoing>Flow_RptYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_Revise</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_IssueReport" name="Issue Final Report">
      <bpmn:incoming>Flow_RptYes</bpmn:incoming>
      <bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_TrackRemediation" name="Track Remediation &amp; Follow-Up">
      <bpmn:incoming>Flow_12</bpmn:incoming>
      <bpmn:outgoing>Flow_End</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Audit Cycle Complete">
      <bpmn:incoming>Flow_End</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_DefineScope" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_DefineScope" targetRef="Task_CreateAuditPlan" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_CreateAuditPlan" targetRef="Task_ProvideEvidence" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_ProvideEvidence" targetRef="Task_ConductFieldwork" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_ConductFieldwork" targetRef="Task_TestControls" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_TestControls" targetRef="Task_DocumentFindings" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_DocumentFindings" targetRef="Gateway_FindingsSeverity" />
    <bpmn:sequenceFlow id="Flow_Critical" name="Yes" sourceRef="Gateway_FindingsSeverity" targetRef="Task_DevelopRemediation" />
    <bpmn:sequenceFlow id="Flow_NoCritical" name="No" sourceRef="Gateway_FindingsSeverity" targetRef="Task_DraftReport" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_DevelopRemediation" targetRef="Task_ImplementRemediation" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_ImplementRemediation" targetRef="Task_DraftReport" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_DraftReport" targetRef="Task_ReviewReport" />
    <bpmn:sequenceFlow id="Flow_11" sourceRef="Task_ReviewReport" targetRef="Gateway_ReportApproved" />
    <bpmn:sequenceFlow id="Flow_RptYes" name="Yes" sourceRef="Gateway_ReportApproved" targetRef="Task_IssueReport" />
    <bpmn:sequenceFlow id="Flow_Revise" name="Revisions Needed" sourceRef="Gateway_ReportApproved" targetRef="Task_ReviewReport" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="Task_IssueReport" targetRef="Task_TrackRemediation" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_TrackRemediation" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
};

/** All built-in templates */
export const builtinTemplates: BuiltinTemplate[] = [
  payrollProcessingTemplate,
  accountsPayableTemplate,
  monthEndCloseTemplate,
  accountsReceivableTemplate,
  inventoryProcureToPayTemplate,
  revenueRecognitionTemplate,
  complianceAuditTemplate,
];
