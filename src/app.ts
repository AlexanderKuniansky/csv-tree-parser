import { Csv, PathBuilder } from "./common/csv"
import { Result } from "./common/types"
const arg: string = process.argv.slice(2)[0] //optional argument
const url: string =
  arg ||
  "https://pics.ebaystatic.com/aw/pics/catchanges/US_NewStructure(Oct2019).csv"
const csvEbay = new Csv(url)
const pathBuilder = new PathBuilder()
;(async () => {
  await csvEbay.download()
  await csvEbay.toJson()
  const result: Result = csvEbay.toResult()
  csvEbay.saveJson()
  const path = pathBuilder.findPath(162968)
  const path2 = pathBuilder.findPath(74469)
  //Just to show it functions
  console.log(result)
  console.log(result[0].name) //Antiques
  console.log(result[0].value) //20081
  console.log(result[10].subSchemas[5].name) // Desktops & All-In-Ones
  console.log("This is a path: " + path) //This is a path: Antiques > Asian Antiques > China > Brush Washers
  console.log("This is another path: " + path2) //This is another path: Sporting Goods > Cycling > Electric Bicycles
})()
