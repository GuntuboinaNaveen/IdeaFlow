
import {
    mkdirSync,
    existsSync,
    readFileSync,
    writeFileSync,
    renameSync,
} from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

export function ideasJsonPlugin(): Plugin {
    let ideasFile = "";

    return {
        name: "internal-ideas-json-persistence",
        apply: "serve",

        configureServer(server) {
            const dataDirectory = resolve(process.cwd(), "data");

            ideasFile = resolve(dataDirectory, "ideas.json");

            mkdirSync(dataDirectory, { recursive: true });

            server.middlewares.use("/api/ideas", (req, res) => {
                res.setHeader(
                    "Content-Type",
                    "application/json; charset=utf-8"
                );

                if (req.url && req.url !== "/") {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: "Not found." }));
                    return;
                }

                // GET: Read data/ideas.json
                if (req.method === "GET") {
                    if (!existsSync(ideasFile)) {
                        res.statusCode = 200;
                        res.end(
                            JSON.stringify({
                                exists: false,
                                ideas: [],
                            })
                        );
                        return;
                    }

                    try {
                        const raw = readFileSync(ideasFile, "utf-8");
                        const ideas: unknown = raw.trim()
                            ? JSON.parse(raw)
                            : [];

                        if (!Array.isArray(ideas)) {
                            res.statusCode = 500;
                            res.end(
                                JSON.stringify({
                                    error: "data/ideas.json must contain a JSON array.",
                                })
                            );
                            return;
                        }

                        res.statusCode = 200;
                        res.end(
                            JSON.stringify({
                                exists: true,
                                ideas,
                            })
                        );
                    } catch {
                        res.statusCode = 500;
                        res.end(
                            JSON.stringify({
                                error: "Unable to read or parse data/ideas.json.",
                            })
                        );
                    }

                    return;
                }

                // PUT: Save data/ideas.json
                if (req.method === "PUT") {
                    let body = "";
                    let tooLarge = false;

                    req.setEncoding("utf8");

                    req.on("data", (chunk: string) => {
                        body += chunk;

                        if (body.length > 10 * 1024 * 1024 && !tooLarge) {
                            tooLarge = true;
                            res.statusCode = 413;
                            res.end(
                                JSON.stringify({
                                    error: "Idea JSON exceeds the 10 MB limit.",
                                })
                            );
                            req.destroy();
                        }
                    });

                    req.on("end", () => {
                        if (tooLarge) return;

                        try {
                            const parsed: unknown = JSON.parse(body);

                            if (!Array.isArray(parsed)) {
                                res.statusCode = 400;
                                res.end(
                                    JSON.stringify({
                                        error: "Expected a JSON array of ideas.",
                                    })
                                );
                                return;
                            }

                            const temporaryFile = `${ideasFile}.tmp`;

                            writeFileSync(
                                temporaryFile,
                                `${JSON.stringify(parsed, null, 2)}\n`,
                                "utf-8"
                            );

                            renameSync(temporaryFile, ideasFile);

                            res.statusCode = 200;
                            res.end(
                                JSON.stringify({
                                    saved: true,
                                    count: parsed.length,
                                })
                            );
                        } catch {
                            res.statusCode = 400;
                            res.end(
                                JSON.stringify({
                                    error: "Invalid idea JSON. File was not changed.",
                                })
                            );
                        }
                    });

                    return;
                }

                res.statusCode = 405;
                res.setHeader("Allow", "GET, PUT");
                res.end(
                    JSON.stringify({
                        error: "Method not allowed.",
                    })
                );
            });
        },
    };
}
