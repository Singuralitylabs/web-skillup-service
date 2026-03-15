import { vi } from "vitest";

vi.spyOn(console, "error").mockImplementation(() => {});
