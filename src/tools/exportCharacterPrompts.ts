import { NAME_DB } from "../engine/nameDb";
import { buildCharacterConcept } from "../engine/characterConcept";

const prompts = NAME_DB.map((name) => ({
  name: name.name,
  gender: name.gender,
  pronunciation: name.pronunciation,
  meaning: name.meaning,
  ...buildCharacterConcept(name),
}));

console.log(JSON.stringify(prompts, null, 2));
