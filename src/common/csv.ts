import * as https from "https"
import * as fs from "fs"

export class Csv {
  private url: string
  private csvFileName: string
  private csvFolderPath: string
  constructor(
    url: string,
    csvFileName: string = "input.csv",
    csvFolderPath: string = "./categories/"
  ) {
    this.url = url
    this.csvFileName = csvFileName
    this.csvFolderPath = csvFolderPath
  }
  download() {
    const file = fs.createWriteStream(this.csvFolderPath + this.csvFileName)
    https.get(this.url, function(response) {
      response.pipe(file)
    })
    return file
  }
}
