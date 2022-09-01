import { uuid } from "./uuid";

it("should create an uuid", () => {
    uuid();
});

it("should create an unique uuid", () => {
    const uuids = new Set<string>();
    for(let i = 0; i < 1000; i++) {
        const id = uuid();
        expect(uuids.has(id)).toBe(false);
        uuids.add(id);
    }
});