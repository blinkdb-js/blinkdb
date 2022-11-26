/// <reference path="../../node_modules/sorted-btree/b+tree.d.ts" />

import "sorted-btree";

declare module "sorted-btree" {
  export default interface Btree {
    /**
     * The total number of items stored in the tree.
     *
     * Used for BTrees where the node values are arrays.
     */
    totalItemSize: number;
  }
}
