require("dotenv").config();

const { Worker } = require("bullmq");

const main = require("../config/db");

const Submission = require("../models/submission");
const Problem = require("../models/problem");
const User = require("../models/user");

const {
    submitHiddenCode
} = require("../utils/problemUtility");

const publisher =
    require("../config/redisPublisher");

const {
    updateRuntimeEstimate
} = require("../scheduler/runtimeEstimator");


const WORKER_CONCURRENCY =
    Number(
        process.env.WORKER_CONCURRENCY || 8
    );


const BENCHMARK_LOGS =
    process.env.BENCHMARK_LOGS !== "false";


const log = (...args) => {

    if (BENCHMARK_LOGS) {
        console.log(...args);
    }

};


const startWorker = async () => {

    try {

        // ==========================================
        // MONGODB
        // ==========================================

        await main();

        console.log(
            "Worker MongoDB Connected"
        );


        // ==========================================
        // BULLMQ WORKER
        // ==========================================

        const worker = new Worker(

            "execution",

            async (job) => {

                try {

                    log(
                        `Job ${job.id} Received`
                    );


                    // ==========================================
                    // 1. FETCH SUBMISSION
                    // ==========================================

                    const submission =
                        await Submission
                            .findById(
                                job.data.submissionId
                            )
                            .select(
                                "userId problemId code language"
                            )
                            .lean();


                    if (!submission) {

                        throw new Error(
                            "Submission not found"
                        );

                    }


                    const problemId =
                        submission.problemId;


                    // ==========================================
                    // 2. FETCH ONLY REQUIRED PROBLEM DATA
                    // ==========================================

                    const problem =
                        await Problem
                            .findById(problemId)
                            .select(
                                "hiddenTestcase runtimeStats"
                            );


                    if (!problem) {

                        throw new Error(
                            "Problem not found"
                        );

                    }


                    const totalTestCases =
                        problem.hiddenTestcase.length;


                    // ==========================================
                    // 3. MARK SUBMISSION AS RUNNING
                    // ==========================================

                    await Submission.updateOne(
                        {
                            _id: submission._id
                        },
                        {
                            $set: {
                                status: "running",
                                testCasesTotal:
                                    totalTestCases
                            }
                        }
                    );


                    // ==========================================
                    // 4. NOTIFY FRONTEND
                    // ==========================================

                    await publisher.publish(

                        "submission-updates",

                        JSON.stringify({

                            submissionId:
                                submission._id.toString(),

                            problemId:
                                submission.problemId.toString(),

                            userId:
                                submission.userId.toString(),

                            status: "running"

                        })

                    );


                    // ==========================================
                    // 5. BUILD TESTCASES
                    // ==========================================

                    const testcases =
                        problem.hiddenTestcase.map(
                            ({ input, output }) => ({
                                input,
                                output
                            })
                        );


                    // ==========================================
                    // 6. EXECUTE ONCE
                    //
                    // compile once inside executor
                    // then execute all testcases
                    // ==========================================

                    const executionResult =
                        await submitHiddenCode(

                            {
                                code:
                                    submission.code,

                                language:
                                    submission.language
                            },

                            testcases,

                            problem

                        );


                    // ==========================================
                    // 7. PROCESS EXECUTION RESULT
                    // ==========================================

                    const result =
                        executionResult.results || [];


                    let runtime =
                        Number(
                            executionResult.totalRuntime
                        ) || 0;


                    let status =
                        "accepted";


                    let errorMessage =
                        null;


                    let testCasesPassed =
                        0;


                    // ==========================================
                    // COMPILATION FAILED
                    // ==========================================

                    if (
                        executionResult.compileSuccess ===
                        false
                    ) {

                        status = "error";

                        errorMessage =
                            executionResult.error ||
                            "Compilation failed";

                    }


                    // ==========================================
                    // EXECUTION RESULT
                    // ==========================================

                    else {

                        for (
                            const test of result
                        ) {

                            if (
                                test.passed
                            ) {

                                testCasesPassed++;

                            }

                            else {

                                status =
                                    "wrong";


                                errorMessage =
                                    test.error ||
                                    "Wrong Answer";


                                break;

                            }

                        }


                        // Safety check
                        if (
                            status === "accepted" &&
                            testCasesPassed !==
                                totalTestCases
                        ) {

                            status =
                                "failed";


                            errorMessage =
                                "Not all test cases were executed";

                        }

                    }


                    // ==========================================
                    // 8. UPDATE RUNTIME ESTIMATE
                    //
                    // Only accepted submissions
                    // ==========================================

                    if (
                        status === "accepted" &&
                        runtime > 0
                    ) {

                        await updateRuntimeEstimate(

                            problem,

                            submission.language,

                            runtime

                        );

                    }


                    // ==========================================
                    // 9. PREPARE FINAL DB UPDATES
                    // ==========================================

                    const finalSubmissionUpdate =
                        Submission.updateOne(

                            {
                                _id: submission._id
                            },

                            {
                                $set: {

                                    runtime,

                                    memory: 0,

                                    status,

                                    errorMessage,

                                    testCasesPassed,

                                    testCasesTotal:
                                        totalTestCases

                                }

                            }

                        );


                    // ==========================================
                    // 10. UPDATE SOLVED PROBLEMS
                    //
                    // Atomic and duplicate-safe
                    // ==========================================

                    let solvedProblemUpdate =
                        Promise.resolve();


                    if (
                        status === "accepted"
                    ) {

                        solvedProblemUpdate =
                            User.updateOne(

                                {
                                    _id:
                                        submission.userId
                                },

                                {
                                    $addToSet: {
                                        problemSolved:
                                            problemId
                                    }
                                }

                            );

                    }


                    // ==========================================
                    // 11. WRITE DATABASE UPDATES
                    // ==========================================

                    await Promise.all([

                        finalSubmissionUpdate,

                        solvedProblemUpdate

                    ]);


                    // ==========================================
                    // 12. FINAL REAL-TIME UPDATE
                    // ==========================================

                    await publisher.publish(

                        "submission-updates",

                        JSON.stringify({

                            submissionId:
                                submission._id.toString(),

                            problemId:
                                submission.problemId.toString(),

                            userId:
                                submission.userId.toString(),

                            status,

                            runtime,

                            memory: 0,

                            testCasesPassed,

                            testCasesTotal:
                                totalTestCases,

                            errorMessage

                        })

                    );


                    return {
                        success: true,

                        status,

                        runtime,

                        testCasesPassed,

                        testCasesTotal:
                            totalTestCases

                    };

                }

                catch (err) {

                    console.log(
                        `Job ${job.id} Error:`,
                        err.message
                    );


                    // Important:
                    // throwing lets BullMQ retry
                    throw err;

                }

            },


            // ==========================================
            // BULLMQ CONFIGURATION
            // ==========================================

            {

                connection: {

                    host: "localhost",

                    port: 6379

                },

                concurrency:
                    WORKER_CONCURRENCY

            }

        );


        // ==========================================
        // JOB ACTIVE
        // ==========================================

        worker.on(
            "active",
            (job) => {

                log(
                    `Job ${job.id} is running`
                );

            }
        );


        // ==========================================
        // JOB COMPLETED
        // ==========================================

        worker.on(
            "completed",
            (job) => {

                log(
                    `Job ${job.id} completed successfully`
                );

            }
        );


        // ==========================================
        // JOB FAILED
        // ==========================================

        worker.on(

            "failed",

            async (job, err) => {

                log(
                    `Job ${job?.id} failed`
                );


                // Retry if attempts remain

                if (
                    job &&
                    job.attemptsMade <
                        (job.opts.attempts || 1)
                ) {

                    log(
                        `Job ${job.id} will be retried. ` +
                        `Attempt ${job.attemptsMade}/` +
                        `${job.opts.attempts || 1}`
                    );

                    return;

                }


                // ==========================================
                // PERMANENT FAILURE
                // ==========================================

                log(
                    `Job ${job?.id} failed permanently`
                );


                try {

                    if (!job) {
                        return;
                    }


                    const submission =
                        await Submission
                            .findById(
                                job.data.submissionId
                            )
                            .select(
                                "_id problemId userId"
                            )
                            .lean();


                    if (!submission) {
                        return;
                    }


                    await Submission.updateOne(

                        {
                            _id:
                                submission._id
                        },

                        {
                            $set: {

                                status:
                                    "failed",

                                errorMessage:
                                    err.message

                            }

                        }

                    );


                    await publisher.publish(

                        "submission-updates",

                        JSON.stringify({

                            submissionId:
                                submission._id.toString(),

                            problemId:
                                submission.problemId.toString(),

                            userId:
                                submission.userId.toString(),

                            status:
                                "failed",

                            error:
                                err.message

                        })

                    );

                }

                catch (dbErr) {

                    console.log(
                        "Failed event DB error:",
                        dbErr.message
                    );

                }

            }

        );


        // ==========================================
        // WORKER ERROR
        // ==========================================

        worker.on(
            "error",
            (err) => {

                console.error(
                    "Worker Error:",
                    err.message
                );

            }
        );


        console.log(
            `Worker Started | Concurrency=${WORKER_CONCURRENCY}`
        );

    }

    catch (err) {

        console.error(
            "Failed to start worker:",
            err
        );

        process.exit(1);

    }

};


startWorker();