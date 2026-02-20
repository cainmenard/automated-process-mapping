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
    <bpmn:userTask id="Task_ApprovePayment" name="Approve Payment (Over ${{approval_threshold}})">
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

/** All built-in templates */
export const builtinTemplates: BuiltinTemplate[] = [
  payrollProcessingTemplate,
  accountsPayableTemplate,
  monthEndCloseTemplate,
];
