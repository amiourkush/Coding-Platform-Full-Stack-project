require("dotenv").config();

const axios = require("axios");
const fs = require("fs");
const { performance } = require("perf_hooks");

const BASE_URL =
    process.env.BENCH_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

// ===============================
// CHANGE THESE TWO VALUES
// ===============================

const EMAIL = "kushkumarsingh1234@gmail.com";
const PASSWORD = "kushsingh";

const PROBLEM_ID = "69d2c2dcb0e27e5982fe95d0";

// Concurrency levels to benchmark
// const BATCHES = [10, 20, 40, 80];
const BATCHES = [40];

// ===============================

const CODE = fs.readFileSync("./benchmark-code.cpp", "utf8");
const LANGUAGE = "c++";

const TERMINAL_STATUSES = new Set([
    "accepted",
    "wrong",
    "failed",
    "error"
]);

function percentile(values, p) {
    if (!values.length) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;

    return sorted[Math.max(0, index)];
}

function average(values) {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

async function login() {
    console.log("\nLogging in...");

    const response = await axios.post(
        `${BASE_URL}/user/login`,
        {
            emailId: EMAIL,
            password: PASSWORD
        }
    );

    const cookies = response.headers["set-cookie"];

    if (!cookies || cookies.length === 0) {
        throw new Error("Login succeeded but no authentication cookie was returned.");
    }

    const cookie = cookies
        .map((value) => value.split(";")[0])
        .join("; ");

    console.log("Login successful.");

    return cookie;
}

async function submit(cookie) {
    const start = performance.now();

    const response = await axios.post(
        `${BASE_URL}/submission/submit/${PROBLEM_ID}`,
        {
            code: CODE,
            language: LANGUAGE
        },
        {
            headers: {
                Cookie: cookie
            }
        }
    );

    const submitEnd = performance.now();

    return {
        submissionId: response.data.submissionId,
        start,
        submitLatency: submitEnd - start
    };
}

async function waitForCompletion(submissionId, cookie, startTime) {
    const timeout = 300000;
    const pollInterval = 1000;

    while (true) {
        if (performance.now() - startTime > timeout) {
            throw new Error(
                `Submission ${submissionId} timed out after ${timeout / 1000}s`
            );
        }

        const response = await axios.get(
            `${BASE_URL}/submission/checkSubmission/${submissionId}`,
            {
                headers: {
                    Cookie: cookie
                }
            }
        );

        const submission = response.data;

        if (
            submission &&
            TERMINAL_STATUSES.has(
                String(submission.status).toLowerCase()
            )
        ) {
            return submission;
        }

        await new Promise((resolve) =>
            setTimeout(resolve, pollInterval)
        );
    }
}

async function runBatch(concurrency, cookie) {
    console.log("\n========================================");
    console.log(`Running ${concurrency} concurrent submissions`);
    console.log("========================================");

    const batchStart = performance.now();

    const jobs = Array.from(
        { length: concurrency },
        async (_, index) => {
            try {
                const submitted = await submit(cookie);

                const result = await waitForCompletion(
                    submitted.submissionId,
                    cookie,
                    submitted.start
                );

                const end = performance.now();

                return {
                    index: index + 1,
                    success: true,
                    status: result.status,
                    endToEndLatency: end - submitted.start,
                    queueRequestLatency: submitted.submitLatency,
                    runtime: Number(result.runtime) || 0
                };
            } catch (error) {
                return {
                    index: index + 1,
                    success: false,
                    error:
                        error.response?.data?.message ||
                        error.message
                };
            }
        }
    );

    const results = await Promise.all(jobs);

    const batchEnd = performance.now();

    const duration = batchEnd - batchStart;

    const successful = results.filter(
        (r) => r.success
    );

    const failed = results.filter(
        (r) => !r.success
    );

    const latencies = successful.map(
        (r) => r.endToEndLatency
    );

    const runtimes = successful.map(
        (r) => r.runtime
    );

    const throughput =
        successful.length / (duration / 1000);

    console.log("\nRESULTS");
    console.log("----------------------------------------");

    console.log(
        `Submitted       : ${concurrency}`
    );

    console.log(
        `Completed       : ${successful.length}`
    );

    console.log(
        `Failed          : ${failed.length}`
    );

    console.log(
        `Batch duration  : ${duration.toFixed(2)} ms`
    );

    console.log(
        `Throughput      : ${throughput.toFixed(2)} submissions/sec`
    );

    console.log(
        `P50 latency     : ${percentile(latencies, 50).toFixed(2)} ms`
    );

    console.log(
        `P95 latency     : ${percentile(latencies, 95).toFixed(2)} ms`
    );

    console.log(
        `P99 latency     : ${percentile(latencies, 99).toFixed(2)} ms`
    );

    console.log(
        `Avg latency     : ${average(latencies).toFixed(2)} ms`
    );

    console.log(
        `Avg judge time  : ${average(runtimes).toFixed(2)} ms`
    );

    if (failed.length) {
        console.log("\nFailures:");

        failed.forEach((r) => {
            console.log(
                `  Submission ${r.index}: ${r.error}`
            );
        });
    }

    return {
        concurrency,
        completed: successful.length,
        failed: failed.length,
        duration,
        throughput,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        avgLatency: average(latencies),
        avgRuntime: average(runtimes)
    };
}

async function main() {
    console.log("========================================");
    console.log(" LeetCode Platform Benchmark");
    console.log("========================================");

    console.log(`Backend: ${BASE_URL}`);
    console.log(`Problem: ${PROBLEM_ID}`);
    console.log(`Scheduler: ${process.env.SCHEDULER_MODE || "WORKLOAD_AWARE"}`);

    const cookie = await login();

    const results = [];

    for (const concurrency of BATCHES) {
        const result = await runBatch(
            concurrency,
            cookie
        );

        results.push(result);

        // Small pause between batches
        await new Promise((resolve) =>
            setTimeout(resolve, 3000)
        );
    }

    console.log("\n\n========================================");
    console.log("FINAL BENCHMARK");
    console.log("========================================");

    console.table(
        results.map((r) => ({
            concurrency: r.concurrency,
            completed: r.completed,
            failed: r.failed,
            throughput: `${r.throughput.toFixed(2)} /sec`,
            P50: `${r.p50.toFixed(0)} ms`,
            P95: `${r.p95.toFixed(0)} ms`,
            P99: `${r.p99.toFixed(0)} ms`
        }))
    );
}

main().catch((error) => {
    console.error("\nBenchmark failed:");
    console.error(error);
    process.exit(1);
});