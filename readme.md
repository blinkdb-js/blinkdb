<p align="center">
  <a href="http://blinkdb.io/" target="blank"><img src="./packages/docs/src/assets/logo.svg" width="120" alt="BlinkDB Logo" /></a>
</p>

<p align="center">
  <a href="http://blinkdb.io/" target="blank">BlinkDB</a> is a in-memory JS database optimized for large scale storage
  on the frontend.
</p>

<hr />

```ts
import { many } from 'blinkdb';

const items = await many(userTable, {
  where: {
    name: { in: ['Alice', 'Charlie'] },
    age: { gt: 24 }
  },
});
```

> BlinkDB is not yet mature. If you aren't convinced with the current feature set, check back in **version 1.0.0**.

## Motivation

Today, SPAs and modern UI frameworks are more complex than ever before, and in the biggest codebases, gigantic amounts of data are used in JS directly. Unfortunately, while user-friendly, the existing solutions - stores like [Redux](https://redux.js.org/) or [MobX](https://mobx.js.org/README.html) - are not optimized for performance with large quantities of entities.

## Description

BlinkDB provides an alternative - a strongly optimized in-memory database for your frontend. With database features such as indexes, query optimization and support for both relational & non-relational data, BlinkDB allows you to query your data with filters, sort and paginate in one go - just like a real database, and just as performant (as far as a database can be in Javascript).

## Getting started

- Check out the website at https://blinkdb.io.
- Read the docs at https://blinkdb.io/docs.
