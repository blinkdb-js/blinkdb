declare module "astro:content" {
  interface Render {
    ".mdx": Promise<{
      Content: import("astro").MarkdownInstance<{}>["Content"];
      headings: import("astro").MarkdownHeading[];
      remarkPluginFrontmatter: Record<string, any>;
    }>;
  }
}

declare module "astro:content" {
  interface Render {
    ".md": Promise<{
      Content: import("astro").MarkdownInstance<{}>["Content"];
      headings: import("astro").MarkdownHeading[];
      remarkPluginFrontmatter: Record<string, any>;
    }>;
  }
}

declare module "astro:content" {
  export { z } from "astro/zod";
  export type CollectionEntry<C extends keyof typeof entryMap> =
    typeof entryMap[C][keyof typeof entryMap[C]];

  // TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
  /**
   * @deprecated
   * `astro:content` no longer provide `image()`.
   *
   * Please use it through `schema`, like such:
   * ```ts
   * import { defineCollection, z } from "astro:content";
   *
   * defineCollection({
   *   schema: ({ image }) =>
   *     z.object({
   *       image: image(),
   *     }),
   * });
   * ```
   */
  export const image: never;

  // This needs to be in sync with ImageMetadata
  export type ImageFunction = () => import("astro/zod").ZodObject<{
    src: import("astro/zod").ZodString;
    width: import("astro/zod").ZodNumber;
    height: import("astro/zod").ZodNumber;
    format: import("astro/zod").ZodUnion<
      [
        import("astro/zod").ZodLiteral<"png">,
        import("astro/zod").ZodLiteral<"jpg">,
        import("astro/zod").ZodLiteral<"jpeg">,
        import("astro/zod").ZodLiteral<"tiff">,
        import("astro/zod").ZodLiteral<"webp">,
        import("astro/zod").ZodLiteral<"gif">,
        import("astro/zod").ZodLiteral<"svg">
      ]
    >;
  }>;

  type BaseSchemaWithoutEffects =
    | import("astro/zod").AnyZodObject
    | import("astro/zod").ZodUnion<import("astro/zod").AnyZodObject[]>
    | import("astro/zod").ZodDiscriminatedUnion<
        string,
        import("astro/zod").AnyZodObject[]
      >
    | import("astro/zod").ZodIntersection<
        import("astro/zod").AnyZodObject,
        import("astro/zod").AnyZodObject
      >;

  type BaseSchema =
    | BaseSchemaWithoutEffects
    | import("astro/zod").ZodEffects<BaseSchemaWithoutEffects>;

  export type SchemaContext = { image: ImageFunction };

  type BaseCollectionConfig<S extends BaseSchema> = {
    schema?: S | ((context: SchemaContext) => S);
  };
  export function defineCollection<S extends BaseSchema>(
    input: BaseCollectionConfig<S>
  ): BaseCollectionConfig<S>;

  type EntryMapKeys = keyof typeof entryMap;
  type AllValuesOf<T> = T extends any ? T[keyof T] : never;
  type ValidEntrySlug<C extends EntryMapKeys> = AllValuesOf<typeof entryMap[C]>["slug"];

  export function getEntryBySlug<
    C extends keyof typeof entryMap,
    E extends ValidEntrySlug<C> | (string & {})
  >(
    collection: C,
    // Note that this has to accept a regular string too, for SSR
    entrySlug: E
  ): E extends ValidEntrySlug<C>
    ? Promise<CollectionEntry<C>>
    : Promise<CollectionEntry<C> | undefined>;
  export function getCollection<
    C extends keyof typeof entryMap,
    E extends CollectionEntry<C>
  >(collection: C, filter?: (entry: CollectionEntry<C>) => entry is E): Promise<E[]>;
  export function getCollection<C extends keyof typeof entryMap>(
    collection: C,
    filter?: (entry: CollectionEntry<C>) => unknown
  ): Promise<CollectionEntry<C>[]>;

  type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
  type InferEntrySchema<C extends keyof typeof entryMap> = import("astro/zod").infer<
    ReturnTypeOrOriginal<Required<ContentConfig["collections"][C]>["schema"]>
  >;

  const entryMap: {
    reference: {
      "clear.mdx": {
        id: "clear.mdx";
        slug: "clear";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "count.mdx": {
        id: "count.mdx";
        slug: "count";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "createDB.mdx": {
        id: "createDB.mdx";
        slug: "createdb";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "createTable.mdx": {
        id: "createTable.mdx";
        slug: "createtable";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "first.mdx": {
        id: "first.mdx";
        slug: "first";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "index.mdx": {
        id: "index.mdx";
        slug: "index";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "insert.mdx": {
        id: "insert.mdx";
        slug: "insert";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "insertMany.mdx": {
        id: "insertMany.mdx";
        slug: "insertmany";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "key.mdx": {
        id: "key.mdx";
        slug: "key";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "many.mdx": {
        id: "many.mdx";
        slug: "many";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "one.mdx": {
        id: "one.mdx";
        slug: "one";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "remove.mdx": {
        id: "remove.mdx";
        slug: "remove";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "removeMany.mdx": {
        id: "removeMany.mdx";
        slug: "removemany";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "removeWhere.mdx": {
        id: "removeWhere.mdx";
        slug: "removewhere";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "update.mdx": {
        id: "update.mdx";
        slug: "update";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "updateMany.mdx": {
        id: "updateMany.mdx";
        slug: "updatemany";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "updateWhere.mdx": {
        id: "updateWhere.mdx";
        slug: "updatewhere";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "upsert.mdx": {
        id: "upsert.mdx";
        slug: "upsert";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "upsertMany.mdx": {
        id: "upsertMany.mdx";
        slug: "upsertmany";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "use.mdx": {
        id: "use.mdx";
        slug: "use";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "uuid.mdx": {
        id: "uuid.mdx";
        slug: "uuid";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
      "watch.mdx": {
        id: "watch.mdx";
        slug: "watch";
        body: string;
        collection: "reference";
        data: InferEntrySchema<"reference">;
      } & { render(): Render[".mdx"] };
    };
  };

  type ContentConfig = typeof import("../src/content/config");
}
