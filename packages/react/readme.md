<p align="center">
  <a href="http://blinkdb.io/" target="blank"><img src="https://raw.githubusercontent.com/blinkdb-js/blinkdb/main/packages/db/logo.svg" width="120" alt="BlinkDB Logo" /></a>
</p>

<p align="center">
  <a href="http://blinkdb.io/" target="blank">BlinkDB</a> is a in-memory JS database optimized for large scale storage
  on the frontend.
</p>

<hr />

```tsx
const Component = () => {
  const { data: users } = useMany(userTable, {
    where: {
      name: { in: ["Alice", "Charlie"] },
      age: { gt: 24 },
    },
  });
  
  ...
}
```

# `@blinkdb/react`

This package contains auxiliary methods for smoothly integrating BlinkDB into [React](https://react.dev/).

## Getting started

- Read the docs at https://blinkdb.io/docs/react.
- Check out the API reference at https://blinkdb.io/docs/reference/react.
