#!/bin/bash
# scaffold-feature.sh
# Scaffolds a new feature folder in Bappi's feature-based structure.
#
# Usage: ./scaffold-feature.sh <feature-name> [base-path]
# Example: ./scaffold-feature.sh auth src/features
#          ./scaffold-feature.sh products features

set -e

FEATURE_NAME="${1}"
BASE_PATH="${2:-src/features}"

if [ -z "$FEATURE_NAME" ]; then
  echo "Usage: scaffold-feature.sh <feature-name> [base-path]"
  echo "Example: scaffold-feature.sh auth src/features"
  exit 1
fi

FEATURE_DIR="${BASE_PATH}/${FEATURE_NAME}"

if [ -d "$FEATURE_DIR" ]; then
  echo "❌ Feature '${FEATURE_NAME}' already exists at ${FEATURE_DIR}"
  exit 1
fi

echo "🐱 Scaffolding feature: ${FEATURE_NAME}"
echo "   Location: ${FEATURE_DIR}"
echo ""

# Create directories
mkdir -p "${FEATURE_DIR}/components"
mkdir -p "${FEATURE_DIR}/hooks"
mkdir -p "${FEATURE_DIR}/screens"
mkdir -p "${FEATURE_DIR}/services"
mkdir -p "${FEATURE_DIR}/store"
mkdir -p "${FEATURE_DIR}/schemas"
mkdir -p "${FEATURE_DIR}/types"
mkdir -p "${FEATURE_DIR}/__tests__"

# Capitalize feature name for class/type names
FEATURE_PASCAL=$(echo "$FEATURE_NAME" | sed 's/-\([a-z]\)/\U\1/g; s/^\([a-z]\)/\U\1/')

# types/index.ts
cat > "${FEATURE_DIR}/types/index.ts" << EOF
// Types for the ${FEATURE_NAME} feature

export type ${FEATURE_PASCAL} = {
  id: string;
  // TODO: add fields
};
EOF

# schemas/index.ts
cat > "${FEATURE_DIR}/schemas/index.ts" << EOF
import { z } from 'zod';

export const ${FEATURE_NAME}Schema = z.object({
  id: z.string(),
  // TODO: add fields
});

export type ${FEATURE_PASCAL}Schema = z.infer<typeof ${FEATURE_NAME}Schema>;
EOF

# services/index.ts
cat > "${FEATURE_DIR}/services/index.ts" << EOF
import { get, post, put, del } from '@/lib/api/request';
import type { ${FEATURE_PASCAL} } from '../types';

// All API calls for the ${FEATURE_NAME} feature
// Components never call these directly — always go through hooks

export async function fetch${FEATURE_PASCAL}List(): Promise<${FEATURE_PASCAL}[]> {
  return get<${FEATURE_PASCAL}[]>('/${FEATURE_NAME}');
}

export async function fetch${FEATURE_PASCAL}(id: string): Promise<${FEATURE_PASCAL}> {
  return get<${FEATURE_PASCAL}>(\`/${FEATURE_NAME}/\${id}\`);
}
EOF

# hooks/index.ts
cat > "${FEATURE_DIR}/hooks/index.ts" << EOF
import { useQuery } from '@tanstack/react-query';
import { fetch${FEATURE_PASCAL}List, fetch${FEATURE_PASCAL} } from '../services';

export const ${FEATURE_NAME}Keys = {
  all: ['${FEATURE_NAME}'] as const,
  list: () => [...${FEATURE_NAME}Keys.all, 'list'] as const,
  detail: (id: string) => [...${FEATURE_NAME}Keys.all, 'detail', id] as const,
};

export function use${FEATURE_PASCAL}List() {
  return useQuery({
    queryKey: ${FEATURE_NAME}Keys.list(),
    queryFn: fetch${FEATURE_PASCAL}List,
  });
}

export function use${FEATURE_PASCAL}(id: string) {
  return useQuery({
    queryKey: ${FEATURE_NAME}Keys.detail(id),
    queryFn: () => fetch${FEATURE_PASCAL}(id),
    enabled: !!id,
  });
}
EOF

# store/index.ts
cat > "${FEATURE_DIR}/store/index.ts" << EOF
import { create } from 'zustand';

type ${FEATURE_PASCAL}Store = {
  // TODO: define state
  selected${FEATURE_PASCAL}Id: string | null;
  setSelected: (id: string | null) => void;
};

export const use${FEATURE_PASCAL}Store = create<${FEATURE_PASCAL}Store>()((set) => ({
  selected${FEATURE_PASCAL}Id: null,
  setSelected: (id) => set({ selected${FEATURE_PASCAL}Id: id }),
}));
EOF

# __tests__/${FEATURE_NAME}.test.ts
cat > "${FEATURE_DIR}/__tests__/${FEATURE_NAME}.test.ts" << EOF
// Tests for the ${FEATURE_NAME} feature
// Test behavior, not implementation — assert outcomes, not internals

describe('${FEATURE_PASCAL}', () => {
  it.todo('add tests here');
});
EOF

# components/.gitkeep
touch "${FEATURE_DIR}/components/.gitkeep"

# screens/.gitkeep
touch "${FEATURE_DIR}/screens/.gitkeep"

# Barrel export — the only thing other features should import from
cat > "${FEATURE_DIR}/index.ts" << EOF
// Public API for the ${FEATURE_NAME} feature
// Other features import only from here — never from internal files

export * from './types';
export * from './hooks';
export * from './store';
// Add component/screen exports as you build them
EOF

echo "✅ Feature '${FEATURE_NAME}' scaffolded successfully!"
echo ""
echo "   ${FEATURE_DIR}/"
echo "   ├── components/      (add your UI components here)"
echo "   ├── hooks/           (TanStack Query hooks — use-${FEATURE_NAME}.ts)"
echo "   ├── screens/         (add your screens here)"
echo "   ├── services/        (API calls — components never import these directly)"
echo "   ├── store/           (Zustand store)"
echo "   ├── schemas/         (Zod validation schemas)"
echo "   ├── types/           (TypeScript types)"
echo "   ├── __tests__/       (tests — test behavior, not implementation)"
echo "   └── index.ts         (barrel export — only public API)"
echo ""
echo "Next steps:"
echo "  1. Define your types in types/index.ts"
echo "  2. Fill in the API calls in services/index.ts"
echo "  3. Add your screens and components"
echo "  4. Export what other features need from index.ts"
echo "  5. Write tests in __tests__/ — focus on behavior, not internals"
