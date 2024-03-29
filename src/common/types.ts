interface CategoriesTree {
  name: string // category name
  value: string // category ID
  subSchemas?: CategoriesTree[] // child categories
}

export type Result = CategoriesTree[]
