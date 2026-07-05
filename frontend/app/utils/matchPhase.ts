type MatchPhaseSource = {
  group?: string | null;
  stage?: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage',
  PRELIMINARY_ROUND: 'Preliminary Round',
  PLAYOFF_ROUND_1: 'Playoff Round 1',
  LAST_64: 'Last 64',
  LAST_32: 'Last 32',
  LAST_16: 'Last 16',
  QUARTER_FINALS: 'Quarter Finals',
  SEMI_FINALS: 'Semi Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export function getMatchPhase(source: MatchPhaseSource) {
  const group = source.group?.trim();
  if (group) {
    return group;
  }

  const stage = source.stage?.trim();
  return stage || null;
}

export function formatMatchPhaseLabel(phase: string) {
  const normalized = phase.trim();

  if (!normalized) {
    return '';
  }

  const mapped = STAGE_LABELS[normalized];
  if (mapped) {
    return mapped;
  }

  if (normalized.startsWith('GROUP_')) {
    return `Group ${normalized.slice('GROUP_'.length).replace(/_/g, ' ')}`;
  }

  return normalized.replace(/_/g, ' ');
}