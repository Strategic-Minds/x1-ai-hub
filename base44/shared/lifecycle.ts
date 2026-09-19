// Backend copy of the AI HUB deterministic lifecycle (mirrors src/lib/lifecycle.js).
// Used by the 24/7 orchestrator so server-side advancement matches the UI assembly line.
export const STAGE_IDS = [
  "PLAN","DISCOVERY","REQUIREMENTS","RESEARCH","BENCHMARKING","STRATEGY",
  "VISUAL_DIRECTION","OPERATOR_APPROVAL","ARCHITECTURE","PROJECT_DOCUMENTATION",
  "PROVISIONING_DRY_RUN","BUILD_PACKET","BRANCH_BUILD","VALIDATION","BOUNDED_REPAIR",
  "PREVIEW_ACCEPTANCE","RELEASE_APPROVAL","PRODUCTION_RELEASE","PRODUCTION_SMOKE_TEST",
  "OPERATE","MONITOR","OPTIMIZE"
];
export const VALIDATION_GATES = ["STATIC_VALIDATION","FUNCTIONAL_VALIDATION","SECURITY_VALIDATION","VISUAL_VALIDATION","OPERATIONAL_VALIDATION"];
export const PROTECTED_STAGES = ["OPERATOR_APPROVAL","RELEASE_APPROVAL","PRODUCTION_RELEASE"];
export const TOTAL = STAGE_IDS.length;
export function stageIndex(id){ return STAGE_IDS.indexOf(id); }
export function nextStageId(id){ const i = stageIndex(id); return (i < 0 || i >= TOTAL - 1) ? null : STAGE_IDS[i + 1]; }