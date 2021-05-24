csv to json parser + transforming categories tree according to requirements:

```
type Result = CategoriesTree[];

interface CategoriesTree {
    name: string; // category name
    value: string; // category ID
    subSchemas?: CategoriesTree[]; // child categories
}
```

Additional requirements:

- Typescript
- async/await usage
- OOP :(

Install:

```
npm install
```

Run:

```
npm start
```

Run with ts-node-dev:

```
npm run dev
```

//TODO: add more info and more commands if/when tests are added
//TODO: No error checking whatsoever, no bueno
