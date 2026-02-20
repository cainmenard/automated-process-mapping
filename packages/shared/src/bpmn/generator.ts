import BpmnModdle from 'bpmn-moddle';
import type {
  BpmnGenerationInput,
  TaskDefinition,
  GatewayDefinition,
  LaneDefinition,
  BpmnTaskType,
  BpmnGatewayType,
} from '../types/index.js';
import { generateBpmnId } from '../utils/index.js';

const BPMN_TASK_TYPE_MAP: Record<BpmnTaskType, string> = {
  userTask: 'bpmn:UserTask',
  serviceTask: 'bpmn:ServiceTask',
  scriptTask: 'bpmn:ScriptTask',
  manualTask: 'bpmn:ManualTask',
  sendTask: 'bpmn:SendTask',
  receiveTask: 'bpmn:ReceiveTask',
  businessRuleTask: 'bpmn:BusinessRuleTask',
  task: 'bpmn:Task',
};

const BPMN_GATEWAY_TYPE_MAP: Record<BpmnGatewayType, string> = {
  exclusiveGateway: 'bpmn:ExclusiveGateway',
  parallelGateway: 'bpmn:ParallelGateway',
  inclusiveGateway: 'bpmn:InclusiveGateway',
  eventBasedGateway: 'bpmn:EventBasedGateway',
};

interface FlowNodeElement {
  id: string;
  $type: string;
  name?: string;
  incoming?: SequenceFlowElement[];
  outgoing?: SequenceFlowElement[];
}

interface SequenceFlowElement {
  id: string;
  $type: string;
  sourceRef: FlowNodeElement;
  targetRef: FlowNodeElement;
}

/**
 * Generates BPMN 2.0 XML from structured input using bpmn-moddle.
 * Produces a collaboration diagram with a single pool and swimlanes.
 */
export async function generateBpmnXml(input: BpmnGenerationInput): Promise<string> {
  const moddle = new BpmnModdle();

  // Build flow nodes (tasks and gateways) grouped by lane
  const allFlowNodes: FlowNodeElement[] = [];
  const nodesByLane = new Map<string, FlowNodeElement[]>();

  // Initialize lane groups
  for (const lane of input.lanes) {
    nodesByLane.set(lane.id, []);
  }

  // Create start event — assigned to the first lane
  const startEvent = moddle.create('bpmn:StartEvent', {
    id: generateBpmnId('StartEvent'),
    name: 'Start',
  }) as unknown as FlowNodeElement;
  startEvent.incoming = [];
  startEvent.outgoing = [];
  allFlowNodes.push(startEvent);

  const firstLaneId = input.lanes[0]?.id;
  if (firstLaneId) {
    nodesByLane.get(firstLaneId)!.push(startEvent);
  }

  // Create task elements
  for (const taskDef of input.tasks) {
    const bpmnType = BPMN_TASK_TYPE_MAP[taskDef.type] ?? 'bpmn:Task';
    const taskEl = moddle.create(bpmnType, {
      id: taskDef.id || generateBpmnId('Activity'),
      name: taskDef.name,
    }) as unknown as FlowNodeElement;
    taskEl.incoming = [];
    taskEl.outgoing = [];
    allFlowNodes.push(taskEl);

    const laneNodes = nodesByLane.get(taskDef.laneId);
    if (laneNodes) {
      laneNodes.push(taskEl);
    }
  }

  // Create gateway elements
  if (input.gateways) {
    for (const gwDef of input.gateways) {
      const bpmnType = BPMN_GATEWAY_TYPE_MAP[gwDef.type] ?? 'bpmn:ExclusiveGateway';
      const gwEl = moddle.create(bpmnType, {
        id: gwDef.id || generateBpmnId('Gateway'),
        name: gwDef.name,
      }) as unknown as FlowNodeElement;
      gwEl.incoming = [];
      gwEl.outgoing = [];
      allFlowNodes.push(gwEl);

      const laneNodes = nodesByLane.get(gwDef.laneId);
      if (laneNodes) {
        laneNodes.push(gwEl);
      }
    }
  }

  // Create end event — assigned to the last lane
  const endEvent = moddle.create('bpmn:EndEvent', {
    id: generateBpmnId('EndEvent'),
    name: 'End',
  }) as unknown as FlowNodeElement;
  endEvent.incoming = [];
  endEvent.outgoing = [];
  allFlowNodes.push(endEvent);

  const lastLaneId = input.lanes[input.lanes.length - 1]?.id;
  if (lastLaneId) {
    nodesByLane.get(lastLaneId)!.push(endEvent);
  }

  // Create sequential flows connecting all nodes in order
  const sequenceFlows: SequenceFlowElement[] = [];
  for (let i = 0; i < allFlowNodes.length - 1; i++) {
    const source = allFlowNodes[i];
    const target = allFlowNodes[i + 1];
    const flow = moddle.create('bpmn:SequenceFlow', {
      id: generateBpmnId('Flow'),
      sourceRef: source,
      targetRef: target,
    }) as unknown as SequenceFlowElement;

    source.outgoing!.push(flow);
    target.incoming!.push(flow);
    sequenceFlows.push(flow);
  }

  // Build lanes
  const laneElements = input.lanes.map((laneDef: LaneDefinition) => {
    const laneNodes = nodesByLane.get(laneDef.id) ?? [];
    return moddle.create('bpmn:Lane', {
      id: laneDef.id || generateBpmnId('Lane'),
      name: laneDef.name,
      flowNodeRef: laneNodes,
    });
  });

  const laneSet = moddle.create('bpmn:LaneSet', {
    id: generateBpmnId('LaneSet'),
    lanes: laneElements,
  });

  // Assemble process
  const process = moddle.create('bpmn:Process', {
    id: generateBpmnId('Process'),
    isExecutable: false,
    laneSets: [laneSet],
    flowElements: [...allFlowNodes, ...sequenceFlows] as any[],
  });

  // Create collaboration with participant
  const participant = moddle.create('bpmn:Participant', {
    id: generateBpmnId('Participant'),
    name: input.variables?.processName ?? 'Process',
    processRef: process,
  });

  const collaboration = moddle.create('bpmn:Collaboration', {
    id: generateBpmnId('Collaboration'),
    participants: [participant],
  });

  // Create definitions (root element)
  const definitions = moddle.create('bpmn:Definitions', {
    id: generateBpmnId('Definitions'),
    targetNamespace: 'http://bpmn.io/schema/bpmn',
    rootElements: [collaboration, process],
  });

  const { xml } = await moddle.toXML(definitions, { format: true });
  return xml!;
}

/**
 * Validates BPMN XML by parsing it with bpmn-moddle.
 * Returns errors if the XML is malformed or violates the BPMN 2.0 schema.
 */
export async function validateBpmnXml(xml: string): Promise<{ valid: boolean; errors: string[] }> {
  const moddle = new BpmnModdle();
  try {
    const { warnings } = await moddle.fromXML(xml);
    const errors = (warnings ?? []).map((w: any) => w.message ?? String(w));
    return { valid: errors.length === 0, errors };
  } catch (err) {
    return { valid: false, errors: [(err as Error).message] };
  }
}

/**
 * Parses BPMN XML and returns the root definitions element.
 */
export async function parseBpmnXml(xml: string): Promise<any> {
  const moddle = new BpmnModdle();
  const { rootElement } = await moddle.fromXML(xml);
  return rootElement;
}
