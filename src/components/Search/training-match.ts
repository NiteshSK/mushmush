import { typeLabel, type TrainingProgram } from "../Training/programme";

/** Words that show the shopper wants a course, not a product. Includes common Hindi words. */
const TRAINING_WORDS = [
  "training", "train", "course", "courses", "class", "classes", "workshop", "learn", "learning", "teach",
  "cultivation", "grow", "growing", "farming", "prashikshan", "sikhna",
];

/** Words in programme names and types today. Only these can start a course lookup without a training word. */
const PROGRAMME_WORDS = ["oyster", "shiitake", "button", "ganoderma", "mushroom"];

/** Small words that do not change what the shopper wants. */
const FILLER = ["a", "an", "the", "and", "of", "for", "in", "on", "at", "to", "how", "me", "near"];

type Programme = Pick<TrainingProgram, "name" | "type" | "slug">;

/** Lower-case words of the query, without filler words. "Mushrooms" and "mushroom" count as the same word. */
function words(text: string) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(word => word && FILLER.indexOf(word) < 0);
}
const stem = (word: string) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word);
const isTrainingWord = (word: string) => TRAINING_WORDS.indexOf(word) >= 0;

/**
 * True when the query could be about training, so search loads the courses. This needs no network,
 * so product-only searches such as "cumin" or "dried mushrooms" never fetch the courses.
 */
export function couldMatchTraining(query: string) {
  const list = words(query);
  if (list.length === 0) return false;
  return list.some(isTrainingWord) || list.every(word => PROGRAMME_WORDS.indexOf(stem(word)) >= 0);
}

/**
 * The programmes to show for a search query.
 * - A query with a training word ("training", "oyster course") shows the programmes whose name or
 *   type has all the other words, or every programme when no programme has them.
 * - A query without a training word ("shiitake") shows the programmes whose name or type has all its words.
 */
export function matchesTraining<T extends Programme>(query: string, programs: T[]): T[] {
  const list = words(query);
  if (list.length === 0) return [];
  const rest = list.filter(word => !isTrainingWord(word)).map(stem);
  const specific = programs.filter(program => {
    const own = words(`${program.name} ${program.type} ${typeLabel(program.type)} ${program.slug}`).map(stem);
    return rest.every(word => own.indexOf(word) >= 0);
  });
  if (rest.length === list.length) return specific;
  return specific.length ? specific : programs;
}
