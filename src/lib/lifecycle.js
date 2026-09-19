// AI HUB deterministic lifecycle — Assembly Line + Deterministic DAG
// Brand pack: AI HUB · Product direction: Assembly Line · Workflow: Deterministic DAG

export const LIFECYCLE_STAGES = [
  { id: "PLAN", label: "Plan", group: "Define" },
  { id: "DISCOVERY", label: "Discovery", group: "Define" },
  { id: "REQUIREMENTS", label: "Requirements", group: "Define" },
  { id: "RESEARCH", label: "Research", group: "Define" },
  { id: "BENCHMARKING", label: "Benchmarking", group: "Define" },
  { id: "STRATEGY", label: "Strategy", group: "Define" },
  { id: "VISUAL_DIRECTION", label: "Visual Direction", group: "Design" },
  { id: "OPERATOR_APPROVAL", label: "Operator Approval", group: "Gate" },
  { id: "ARCHITECTURE", label: "Architecture", group: "Design" },
  { id: "PROJECT_DOCUMENTATION", label: "Documentation", group: "Design" },
  { id: "PROVISIONING_DRY_RUN", label: "Dry Run", group: "Build" },
  { id: "BUILD_PACKET", label: "Build Packet", group: "Build" },
  { id: "BRANCH_BUILD", label: "Branch Build", group: "Build" },
  {
    id: "VALIDATION",
    label: "Validation",
    group: "Validate",
    parallel: [
      { id: "STATIC_VALIDATION", label: "Static" },
      { id: "FUNCTIONAL_VALIDATION", label: "Functional" },
      { id: "SECURITY_VALIDATION", label: "Security" },
      { id: "VISUAL_VALIDATION", label: "Visual" },
      { id: "OPERATIONAL_VALIDATION", label: "Operational" },
    ],
  },
  { id: "BOUNDED_REPAIR", label: "Bounded Repair", group: "Validate" },
  { id: "PREVIEW_ACCEPTANCE", label: "Preview Acceptance", group: "Release" },
  { id: "RELEASE_APPROVAL", label: "Release Approval", group: "Release" },
  { id: "PRODUCTION_RELEASE", label: "Production Release", group: "Release" },
  { id: "PRODUCTION_SMOKE_TEST", label: "Smoke Test", group: "Release" },
  { id: "OPERATE", label: "Operate", group: "Operate" },
  { id: "MONITOR", label: "Monitor", group: "Operate" },
  { id: "OPTIMIZE", label: "Optimize", group: "Operate" },
];

export const STAGE_GROUPS = [
  { key: "Define", color: "#000000" },
  { key: "Design", color: "#CCBB00" },
  { key: "Gate", color: "#000000" },
  { key: "Build", color: "#CCBB00" },
  { key: "Validate", color: "#000000" },
  { key: "Release", color: "#CCBB00" },
  { key: "Operate", color: "#000000" },
];

export function stageIndex(stageId) {
  return LIFECYCLE_STAGES.findIndex((s) => s.id === stageId);
}

export function nextStage(stageId) {
  const i = stageIndex(stageId);
  if (i < 0 || i >= LIFECYCLE_STAGES.length - 1) return null;
  return LIFECYCLE_STAGES[i + 1];
}

export function stageStatus(stageId, currentStageId) {
  const i = stageIndex(stageId);
  const c = stageIndex(currentStageId);
  if (i < c) return "done";
  if (i === c) return "active";
  return "pending";
}