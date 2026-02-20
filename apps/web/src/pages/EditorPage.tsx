import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BpmnEditor } from '../components/BpmnEditor.js';
import { useBpmnStore } from '../stores/bpmn-store.js';
import { fetchProcessMap, createVersion } from '../lib/api.js';

// Default empty diagram for blank canvas
const EMPTY_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export function EditorPage() {
  const { processMapId } = useParams<{ processMapId: string }>();
  const location = useLocation();
  const { setProcessMapId } = useBpmnStore();

  // If navigated from template form, use the generated XML
  const stateXml = (location.state as any)?.bpmnXml;

  // If editing an existing process map, fetch it
  const { data } = useQuery({
    queryKey: ['processMap', processMapId],
    queryFn: () => fetchProcessMap(processMapId!),
    enabled: !!processMapId,
  });

  useEffect(() => {
    setProcessMapId(processMapId ?? null);
  }, [processMapId, setProcessMapId]);

  // Determine which XML to show
  const initialXml = stateXml ?? data?.data?.bpmnXml ?? EMPTY_BPMN;

  const handleSaveVersion = async (xml: string) => {
    if (!processMapId) {
      // TODO: Open "Save As" dialog to create a new process map
      alert('Save process map first to enable versioning.');
      return;
    }

    try {
      await createVersion(processMapId, {
        createdById: 'current-user', // Will be replaced with Clerk user ID
      });
    } catch (err) {
      console.error('Failed to save version:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-57px)]">
      <BpmnEditor
        initialXml={initialXml}
        onSave={handleSaveVersion}
        autosave={!!processMapId}
      />
    </div>
  );
}
