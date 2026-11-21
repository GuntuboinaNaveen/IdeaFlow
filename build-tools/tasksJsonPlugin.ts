import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * Development-only JSON persistence for INTERNAL tasks.
 * Writes to <project-root>/data/tasks.json.
 */
export function tasksJsonPlugin(): Plugin {
    let tasksFile = "";

    return {
        name: "internal-tasks-json-persistence",
        apply: "serve",

        configureServer(server) {
            const dataDirectory = resolve(process.cwd(), "data");
            tasksFile = resolve(dataDirectory, "tasks.json");
            mkdirSync(dataDirectory, { recursive: true });

            server.middlewares.use("/api/tasks", (req, res, next) => {
                if (!req.url || req.url === "/") {
                    if (req.method === "GET") {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json; charset=utf-8");

                        if (!existsSync(tasksFile)) {
                            res.end(JSON.stringify({ exists: false, tasks: [] }));
                            return;
                        }

                        try {
                            const raw = readFileSync(tasksFile, "utf-8");
                            const tasks: unknown = raw.trim() ? JSON.parse(raw) : [];
                            if (!Array.isArray(tasks)) {
                                res.statusCode = 500;
                                res.end(JSON.stringify({ error: "data/tasks.json must contain a JSON array." }));
                                return;
                            }
                            res.end(JSON.stringify({ exists: true, tasks }));
                        } catch {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: "Unable to read or parse data/tasks.json." }));
                        }
                        return;
                    }

                    if (req.method === "PUT") {
                        let body = "";
                        req.setEncoding("utf8");
                        req.on("data", (chunk: string) => {
                            body += chunk;
                            if (body.length > 10 * 1024 * 1024) {
                                res.statusCode = 413;
                                res.end(JSON.stringify({ error: "Task JSON exceeds the 10 MB limit." }));
                                req.destroy();
                            }
                        });
                        req.on("end", () => {
                            try {
                                const parsed: unknown = JSON.parse(body);
                                if (!Array.isArray(parsed)) {
                                    res.statusCode = 400;
                                    res.end(JSON.stringify({ error: "Expected a JSON array of tasks." }));
                                    return;
                                }

                                const temporaryFile = `${tasksFile}.tmp`;
                                writeFileSync(temporaryFile, `${JSON.stringify(parsed, null, 2)}\n`, "utf-8");
                                renameSync(temporaryFile, tasksFile);

                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json; charset=utf-8");
                                res.end(JSON.stringify({ saved: true, count: parsed.length }));
                            } catch {
                                res.statusCode = 400;
                                res.end(JSON.stringify({ error: "Invalid task JSON; file was not changed." }));
                            }
                        });
                        return;
                    }
                }

                res.statusCode = 405;
                res.setHeader("Allow", "GET, PUT");
                res.end(JSON.stringify({ error: "Method not allowed." }));
                next();
            });
        },
    };
}
