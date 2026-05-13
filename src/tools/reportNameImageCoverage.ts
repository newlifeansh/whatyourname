import { NAME_DB } from "../engine/nameDb";
import { getAllNameImages } from "../engine/nameImage";

const imageMap = getAllNameImages();

function summarize(gender: "male" | "female") {
  const rows = NAME_DB.filter((name) => name.gender === gender);
  const custom = rows.filter((name) =>
    imageMap[`${name.name}-${name.gender}`]?.startsWith("name-images/"),
  );
  const pending = rows
    .filter((name) => !imageMap[`${name.name}-${name.gender}`]?.startsWith("name-images/"))
    .map((name) => name.name);

  return {
    total: rows.length,
    custom: custom.length,
    pending: pending.length,
    nextPending: pending.slice(0, 20),
  };
}

console.log(
  JSON.stringify(
    {
      male: summarize("male"),
      female: summarize("female"),
      totalCustom: Object.values(imageMap).filter((path) => path.startsWith("name-images/")).length,
      totalNames: NAME_DB.length,
    },
    null,
    2,
  ),
);
