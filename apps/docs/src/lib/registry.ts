import registryData from '../../../../registry.json';

export interface ComponentMeta {
  name: string;
  description: string;
  files: string[];
  category: string;
}

export interface RegistryData {
  name: string;
  version: string;
  description: string;
  themes: string[];
  components: ComponentMeta[];
}

const registry = registryData as RegistryData;

export function getComponent(slug: string): ComponentMeta | undefined {
  return registry.components.find((c) => c.name === slug);
}

export function getAllComponents(): ComponentMeta[] {
  return registry.components;
}

export function getAllSlugs(): string[] {
  return registry.components.map((c) => c.name);
}

export function getComponentsByCategory(): Record<string, ComponentMeta[]> {
  const grouped: Record<string, ComponentMeta[]> = {};
  for (const component of registry.components) {
    const cat = component.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(component);
  }
  return grouped;
}

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  ai: 'AI',
  layout: 'Layout',
  dataviz: 'Data Viz',
  motion: 'Motion',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
