const express = require("express");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");
const cors = require("cors");

const executorName =
    process.env.EXECUTOR_NAME || "executor";

const app = express();

app.use(cors());
app.use(express.json());

const EXECUTION_TIMEOUT = 5000;
const COMPILE_TIMEOUT = 15000;
const MAX_OUTPUT = 1024 * 1024; // 1 MB


function runProcess(command, args, options = {}) {

    return new Promise((resolve) => {

        const {
            cwd,
            input = "",
            timeout = EXECUTION_TIMEOUT
        } = options;

        const start = Date.now();

        const child = spawn(
            command,
            args,
            {
                cwd,
                stdio: ["pipe", "pipe", "pipe"]
            }
        );

        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let outputTooLarge = false;

        const timer = setTimeout(() => {

            timedOut = true;

            child.kill("SIGKILL");

        }, timeout);


        child.stdout.on("data", (chunk) => {

            stdout += chunk.toString();

            if (stdout.length > MAX_OUTPUT) {

                outputTooLarge = true;

                child.kill("SIGKILL");

            }

        });


        child.stderr.on("data", (chunk) => {

            stderr += chunk.toString();

            if (stderr.length > MAX_OUTPUT) {

                stderr =
                    stderr.slice(
                        0,
                        MAX_OUTPUT
                    );

            }

        });


        child.on("error", (error) => {

            clearTimeout(timer);

            resolve({
                success: false,
                output: "",
                error: error.message,
                runtime: Date.now() - start
            });

        });


        child.on("close", (exitCode) => {

            clearTimeout(timer);

            const runtime =
                Date.now() - start;


            if (timedOut) {

                resolve({
                    success: false,
                    output: "",
                    error: "Time Limit Exceeded",
                    runtime
                });

                return;

            }


            if (outputTooLarge) {

                resolve({
                    success: false,
                    output: "",
                    error: "Output Limit Exceeded",
                    runtime
                });

                return;

            }


            if (exitCode !== 0) {

                resolve({
                    success: false,
                    output: stdout,
                    error:
                        stderr ||
                        `Process exited with code ${exitCode}`,
                    runtime
                });

                return;

            }


            resolve({
                success: true,
                output: stdout,
                error: null,
                runtime
            });

        });


        if (input) {

            child.stdin.write(input);

        }

        child.stdin.end();

    });

}


async function compileProgram(
    language,
    fileName,
    dir
) {

    if (language === "python") {

        return {
            success: true,
            runtime: 0,
            error: null
        };

    }


    if (language === "c++") {

        return await runProcess(
            "g++",
            [
                fileName,
                "-O2",
                "-std=c++17",
                "-o",
                "code"
            ],
            {
                cwd: dir,
                timeout: COMPILE_TIMEOUT
            }
        );

    }


    if (language === "java") {

        return await runProcess(
            "javac",
            [fileName],
            {
                cwd: dir,
                timeout: COMPILE_TIMEOUT
            }
        );

    }


    return {
        success: false,
        runtime: 0,
        error: "Unsupported language"
    };

}


async function runCompiledProgram(
    language,
    dir,
    fileName,
    input
) {

    if (language === "c++") {

        const executable =
            path.join(dir, "code");

        return await runProcess(
            executable,
            [],
            {
                cwd: dir,
                input,
                timeout: EXECUTION_TIMEOUT
            }
        );

    }


    if (language === "java") {

        return await runProcess(
            "java",
            [
                "-cp",
                dir,
                "Main"
            ],
            {
                cwd: dir,
                input,
                timeout: EXECUTION_TIMEOUT
            }
        );

    }


    if (language === "python") {

        return await runProcess(
            "python3",
            [fileName],
            {
                cwd: dir,
                input,
                timeout: EXECUTION_TIMEOUT
            }
        );

    }


    return {
        success: false,
        output: "",
        error: "Unsupported language",
        runtime: 0
    };

}


/*
=====================================================
BATCH EXECUTION

Compile ONCE per submission.
Execute the compiled program against every testcase.
=====================================================
*/

app.post(
    "/run-batch",
    async (req, res) => {

        const {
            language,
            code,
            testcases
        } = req.body;


        if (
            !language ||
            !code ||
            !Array.isArray(testcases) ||
            testcases.length === 0
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "language, code and testcases are required"

            });

        }


        const jobId = randomUUID();

        const dir =
            path.join(
                __dirname,
                "temp",
                jobId
            );


        fs.mkdirSync(
            dir,
            {
                recursive: true
            }
        );


        let fileName;


        try {

            /*
            ==========================================
            CREATE SOURCE FILE
            ==========================================
            */

            if (language === "c++") {

                fileName = "code.cpp";

            }

            else if (language === "python") {

                fileName = "code.py";

            }

            else if (language === "java") {

                fileName = "Main.java";

            }

            else {

                return res.status(400).json({

                    success: false,
                    error: "Unsupported language"

                });

            }


            fs.writeFileSync(
                path.join(dir, fileName),
                code
            );


            /*
            ==========================================
            COMPILE ONCE
            ==========================================
            */

            const totalStart =
                Date.now();


            const compileResult =
                await compileProgram(
                    language,
                    fileName,
                    dir
                );


            const compileRuntime =
                compileResult.runtime;


            if (!compileResult.success) {

                fs.rmSync(
                    dir,
                    {
                        recursive: true,
                        force: true
                    }
                );


                return res.json({

                    success: false,

                    compileSuccess: false,

                    error:
                        compileResult.error,

                    compileRuntime,

                    totalRuntime:
                        Date.now() - totalStart,

                    results: []

                });

            }


            /*
            ==========================================
            RUN ALL TESTCASES
            ==========================================
            */

            const results = [];


            for (
                const testcase of testcases
            ) {

                const result =
                    await runCompiledProgram(
                        language,
                        dir,
                        fileName,
                        testcase.input || ""
                    );


                const expectedOutput =
                    String(
                        testcase.output || ""
                    ).trim();


                const actualOutput =
                    String(
                        result.output || ""
                    ).trim();


                const passed =
                    result.success &&
                    actualOutput ===
                    expectedOutput;


                results.push({

                    passed,

                    output:
                        result.output,

                    error:
                        result.error,

                    runtime:
                        result.runtime

                });


                /*
                Stop immediately after
                first failed testcase.
                */

                if (!passed) {

                    break;

                }

            }


            const totalRuntime =
                Date.now() -
                totalStart;


            fs.rmSync(
                dir,
                {
                    recursive: true,
                    force: true
                }
            );


            const allPassed =
                results.length ===
                    testcases.length &&
                results.every(
                    result =>
                        result.passed
                );


            return res.json({

                success:
                    allPassed,

                compileSuccess: true,

                compileRuntime,

                totalRuntime,

                results

            });

        }

        catch (error) {

            fs.rmSync(
                dir,
                {
                    recursive: true,
                    force: true
                }
            );


            return res.status(500).json({

                success: false,

                compileSuccess: false,

                error:
                    error.message,

                results: []

            });

        }

    }
);


app.get(
    "/health",
    (req, res) => {

        res.json({

            healthy: true,

            executor:
                executorName

        });

    }
);


app.listen(
    4000,
    () => {

        console.log(
            `${executorName} running`
        );

    }
);