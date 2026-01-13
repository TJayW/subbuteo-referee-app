/**
 * Search Helpers
 * Pure utility functions for search algorithms
 */

/**
 * Simple fuzzy search
 * Verifica se tutti i caratteri della query appaiono in ordine nel target
 * 
 * @example
 * fuzzyMatch('goa', 'goal') // true
 * fuzzyMatch('fst', 'first_half') // true
 * fuzzyMatch('xyz', 'goal') // false
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qIndex = 0;
  
  for (let i = 0; i < t.length && qIndex < q.length; i++) {
    if (t[i] === q[qIndex]) qIndex++;
  }
  
  return qIndex === q.length;
}
