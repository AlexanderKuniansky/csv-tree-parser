import { Csv } from "./common/csv"
import { Result } from "./common/types"
const arg: string = process.argv.slice(2)[0] //optional argument
const url: string =
  arg ||
  "https://pics.ebaystatic.com/aw/pics/catchanges/US_NewStructure(Oct2019).csv"
const csvEbay = new Csv(url)
;(async () => {
  await csvEbay.download()
  await csvEbay.toJson()
  const result: Result = csvEbay.toResult()
  //Just to show it functions
  console.log(result)
  console.log(result[0].name)
  console.log(result[0].value)
  console.log(result[10].subSchemas[5].name)
  csvEbay.saveJson()
})()
