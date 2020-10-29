import { join } from "https://deno.land/std@0.75.0/path/mod.ts";
import { BufReader } from "https://deno.land/std@0.75.0/io/bufio.ts";
import { parse } from "https://deno.land/std@0.75.0/encoding/csv.ts";
// use pick to filter out only the attributes from the CSV we care about
import pick from "https://deno.land/x/lodash@4.17.15-es/pick.js";

interface Planet {
  [key: string]: string;
}

const loadPlanetData = async (): Promise<Array<Planet>> => {
  const path: string = join("data", "kepler_exoplanets_nasa.csv");
  const file: Deno.File = await Deno.open(path);
  const bufReader: BufReader = new BufReader(file);

  // ParsingOptions skipFirstRow without columns defined treats it as header
  const result = await parse(bufReader, {
    skipFirstRow: true,
    comment: "#",
  });

  // close the file using its resource ID
  Deno.close(file.rid);

  /**
   * Want to find planets where:
   * - the disposition is confirmed
   * - radius of planet should be between 0.5 and 1.5 of Earth's radii to increase chances of
   *  a rocky composition and maintain surface liquid water
   * - host-star mass for planets with intelligent life was found to be 0.78 M < M < 1.04 M
   * - host-star should have similar stats to our sun
   */
  const planets: Array<Planet> = (result as Array<Planet>).filter(
    (planet: Planet) => {
      const planetaryRadius = Number(planet["koi_prad"]);
      const stellarMass = Number(planet["koi_smass"]);
      const stellarRadius = Number(planet["koi_srad"]);
      return planet["koi_disposition"] === "CONFIRMED" &&
        planetaryRadius > 0.5 &&
        planetaryRadius < 1.5 && stellarMass > 0.78 && stellarMass < 1.04 &&
        stellarRadius > 0.99 && stellarRadius < 1.01;
    },
  );

  return planets.map((planet: Planet) => {
    return pick(planet, [
      "kepler_name",
      "koi_prad",
      "koi_smass",
      "koi_srad",
      "koi_count",
      "koi_steff",
      "koi_period",
    ]);
  });
};

const newEarths: Array<Planet> = await loadPlanetData();
console.log(`${newEarths.length} habitable planets found! Here they are:`);
for (const planet of newEarths) {
  console.log(planet);
}

const getOrbitalData = async (newEarthData: Array<Planet>): Promise<void> => {
  let min: number = 0;
  let max: number = 0;
  for (let i = 0; i < newEarthData.length; i++) {
    if (
      Number(newEarthData[i]["koi_period"]) <
        Number(newEarthData[min]["koi_period"])
    ) {
      min = i;
    }
    if (
      Number(newEarthData[i]["koi_period"]) >
        Number(newEarthData[max]["koi_period"])
    ) {
      max = i;
    }
  }
  console.log(
    `Planet with the shortest orbital period is ${
      newEarthData[min]["kepler_name"]
    } at ${newEarthData[min]["koi_period"]} days.`,
  );
  console.log(
    `Planet with the longest orbital period is ${
      newEarthData[max]["kepler_name"]
    } at ${newEarthData[max]["koi_period"]} days.`,
  );
};

await getOrbitalData(newEarths);
