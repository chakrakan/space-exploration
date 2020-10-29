# Space Exploration

Playing around with [Deno](https://deno.land/) stdlib to sift through [Kepler Expolanets data](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative).

### Installation

1. Ensure you have Deno installed: https://deno.land/
2. In the terminal, run: `deno run --allow-read mod.ts`

### Notes

- This implementation is up-to date with the most recent version of Deno (1.5) and should have most types declared
- BufReader from the io/bufio module has a differing type definition for the private variable buf as to the one utilized in parse from the encoding/csv module. This is circumvented for now using `any` type
- We can find exoplanets most similar to Earth along with ones with the shortest/longest oribtal periods

> This was done for learning purposes as part of a Deno course
