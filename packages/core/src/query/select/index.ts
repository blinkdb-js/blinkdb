/**
 * @file The selecting engine for ThunderDB.
 * 
 * Querying items from the database happens in two stages:
 * 
 *  - First, the given filter is evaluated in order to determine how items from the database
 *    are to be loaded. Some queries must scan the whole table, others can use an index
 *    so that not every row needs to be checked against the filter.
 *  
 * This happens in this `query/select` module.
 * 
 *  - Once all items from the db have been loaded, they are checked against the filter to see
 *    if they match. Only matching items are returned to the user.
 * 
 * This is implemented in the `query/filter` module.
 */

export * from './matchers';
export * from './where';