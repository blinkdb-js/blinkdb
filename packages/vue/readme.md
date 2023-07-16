<p align="center">
  <a href="http://blinkdb.io/" target="blank"><img src="https://raw.githubusercontent.com/blinkdb-js/blinkdb/main/packages/db/logo.svg" width="120" alt="BlinkDB Logo" /></a>
</p>

<p align="center">
  <a href="http://blinkdb.io/" target="blank">BlinkDB</a> is a in-memory JS database optimized for large scale storage
  on the frontend.
</p>

<hr />

```vue
<script setup>
import { watchMany } from '@blinkdb/vue';
import { userTable } from './db';

const { data: users } = await watchMany(userTable, {
  where: {
    name: { in: ["Alice", "Charlie"] },
    age: { gt: 24 },
  },
});
</script>

...
```

# `@blinkdb/vue`

This package contains auxiliary methods for smoothly integrating BlinkDB into [Vue](https://vuejs.org/).

## Getting started

- Read the docs at https://blinkdb.io/docs/vue.
- Check out the API reference at https://blinkdb.io/docs/reference/vue.