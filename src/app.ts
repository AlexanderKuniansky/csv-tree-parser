import { Csv } from "./common/csv"

const arg: string = process.argv.slice(2)[0] //optional argument
const url: string =
  arg ||
  "https://pics.ebaystatic.com/aw/pics/catchanges/US_NewStructure(Oct2019).csv"
const csvEbay = new Csv(url)
;(async () => {
  await csvEbay.download()
  await csvEbay.parse()
  csvEbay.saveJson()
})()
