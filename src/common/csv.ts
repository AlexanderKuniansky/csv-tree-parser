import * as fs from "fs"
import * as parse from "csv-parse"
import * as fetch from "node-fetch"

export class Csv {
  private jsonString: string
  private records: string[] = []

  private url: string
  private csvFileName: string
  private csvFolderPath: string
  
  //Assumed that we always need csv from url when we create class
  constructor(
    url: string,
    csvFileName: string = "input.csv",
    csvFolderPath: string = "./categories/"
  ) {
    this.url = url
    this.csvFileName = csvFileName
    this.csvFolderPath = csvFolderPath
  }

  async download() {
    const res = await fetch(this.url)
    const fileStream = fs.createWriteStream(
      this.csvFolderPath + this.csvFileName
    )
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream)
      res.body.on("error", reject)
      fileStream.on("finish", resolve)
    })
  }

  private async CsvToArray() {
    const parser = fs.createReadStream(this.csvFolderPath+this.csvFileName).pipe(
      parse({
        bom: true,
        relax: true,
        from: 4, //skip rows without data //11454 is the annoying row
        escape: "\\"
      })
    )
    for await (const record of parser) {
      // record length-1 to ignore the id collumn 
      for (let i = 0; i < record.length - 1; i++) {        
        if (record[i] !=="") {
          // Americans can't use metric system like normal people && They are too lazy  to escape characters => what can possibly go wrong
          // csv-parse (with "relax" option) doesn't remove quotes if there is an unescaped quote inside of string aka  `"text " here"` instead of  `text " here` hence this duck tape solution
          // either there is some combination of csv-parse options I missed or there is another parser that will work with this case or it can be done by hand but I am too lazy for that
          if (record[i][0] == `"`) {
            record[i] = record[i].slice(1, -1).replace(`"`, `\\"`) //cut quotes in the beggining and end of string and escape quotes inside to not mess with JSON
          }
          //Note: Json can be built here like mentioned below but got moved  to sseparate method to make flow more obvious
          // categoriesForestJsonBuilder.addCategory(
          //   record[i],
          //   record[record.length - 1],
          //   i
          // )
        }
      }
      this.records.push(record)
    }
  }
  private async arrayToJson() {
    let categoriesForestJsonBuilder = new CategoriesForestJsonBuilder()
    //go through all records, in each record find all non null fields (avoiding las collumn with id's), use the found field to add category to the json
    for await (const record of this.records) {
      for (let i = 0; i < record.length - 1; i++) {
        if (record[i] !=="") {
        categoriesForestJsonBuilder.addCategory(
          record[i],
          record[record.length - 1],
          i
        )
        }
      }
    }
    this.jsonString = categoriesForestJsonBuilder.getJsonString()
  }
  saveJson(jsonFileName: string="result.json", jsonFolderPath: string="./categories/") {
    fs.writeFileSync(jsonFolderPath+jsonFileName, this.jsonString)
  }
  async parse() {
    await this.CsvToArray()
    await this.arrayToJson()
  }
}

class CategoriesForestJsonBuilder {
  private jsonString: string // json string that we are generating
  private head: number //current column (tree level)

  constructor(string: string = "") {
    this.jsonString = string
    //We assume that tree always starts at column
    this.head = 0
  }
  addCategory(name: string, value: string, column: number) {
    //compare level of the the previously added node and current one
    if (column == this.head) {
      this.addSibling(name, value)
    } else if (column == this.head + 1) {
      this.addChild(name, value)
    } else if (column < this.head) {
      let levelDifference = this.head - column
      this.addAncestor(name, value, levelDifference)
    } else {
      throw new Error(
        `Column is higher than current head by more than one, can't add descendant skipping levels`
      )
    }
    this.head = column
  }

  private addSibling(name: string, value: string) {
    this.jsonString += `},{"name":"${name}","value":${value}`
  }

  private addChild(name: string, value: string) {
    this.jsonString += `,"subSchemas":[{"name":"${name}","value":${value}`
  }

  private addAncestor(name: string, value: string, levelDifference: number) {
    for (let i = 0; i < levelDifference; i++) {
      this.jsonString += `}]`
    }
    this.jsonString += `},{"name":"${name}","value":${value}`
  }

  private fixBeginingAndEnd() {
    this.jsonString = `[` + this.jsonString.slice(2)
    for (let i = 0; i < this.head; i++) {
      this.jsonString += `}]`
    }
    this.jsonString += `}]`
  }

  getJsonString() {
    //Can't say "fixing" the json string right before it's returned is a beatiful solution but cheap on resources and works fine since jsonString is private anyway. Alternative would be to always insert category in the middle  of json string and keep the string  always valid (too much effort).
    this.fixBeginingAndEnd()
    const result = this.jsonString
    this.reset()
    return result
  }

  reset() {
    this.jsonString = ""
    this.head = 0
  }
}
