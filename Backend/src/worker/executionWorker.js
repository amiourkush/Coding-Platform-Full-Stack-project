require("dotenv").config();

const { Worker } = require("bullmq");

const main = require("../config/db");

const Submission = require("../models/submission");
const Problem = require("../models/problem");
const User = require("../models/user");

const { submitHiddenCode } = require("../utils/problemUtility");
const publisher = require("../config/redisPublisher");
const { updateRuntimeEstimate } = require("../scheduler/runtimeEstimator");


const startWorker = async () => {

  try {

    // ==========================================
    // IMPORTANT:
    // Worker is a separate Node process,
    // therefore it needs its OWN MongoDB connection.
    // ==========================================

    await main();

    console.log("Worker MongoDB Connected");


    // ==========================================
    // CREATE BULLMQ WORKER
    // ==========================================

    const worker = new Worker(

      "execution",

      async (job) => {

        try {

          console.log(`Job ${job.id} Received`);


          // ==========================================
          // 1. FETCH SUBMISSION
          // ==========================================

          const submission =
            await Submission.findById(
              job.data.submissionId
            );


          if (!submission) {

            throw new Error(
              "Submission not found"
            );

          }


          // ==========================================
          // 2. FETCH PROBLEM
          // ==========================================

          const problemId =
            submission.problemId;


          const problem =
            await Problem.findById(
              problemId
            );


          if (!problem) {

            throw new Error(
              "Problem not found"
            );

          }


          // ==========================================
          // 3. MARK SUBMISSION AS RUNNING
          // ==========================================

          submission.status = "running";

          await submission.save();


          // Notify frontend through Redis Pub/Sub

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
          // 4. CREATE HIDDEN TESTCASE ARRAY
          // ==========================================

          const testCaseArray =
            problem.hiddenTestcase.map(

              ({ input, output }) => ({

                code:
                  submission.code,

                language:
                  submission.language,

                input,

                output

              })

            );


          // ==========================================
          // 5. SEND SUBMISSION TO
          //    WORKLOAD-AWARE SCHEDULER
          // ==========================================

          const result =
            await submitHiddenCode(
              testCaseArray,
              problem
            );


          // ==========================================
          // 6. PROCESS EXECUTION RESULT
          // ==========================================

          let runtime = 0;

          let status = "accepted";

          let errorMessage = null;

          let testCasesPassed = 0;


          for (const test of result) {

            if (test.passed) {

              testCasesPassed++;

              runtime +=
                Number(test.runtime) || 0;

            }

            else {

              status = "wrong";

              errorMessage =
                test.error || "Wrong Answer";

              break;

            }

          }


          // ==========================================
          // SAFETY CHECK
          //
          // Accepted only when every hidden testcase
          // has actually been executed successfully.
          // ==========================================

          if (
            status === "accepted" &&
            testCasesPassed !==
              problem.hiddenTestcase.length
          ) {

            status = "failed";

            errorMessage =
              "Not all test cases were executed";

          }


          // ==========================================
          // 7. UPDATE RUNTIME ESTIMATE
          //
          // Only learn from ACCEPTED submissions.
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
          // 8. UPDATE SUBMISSION
          // ==========================================

          submission.runtime =
            runtime;

          submission.memory =
            0;

          submission.status =
            status;

          submission.errorMessage =
            errorMessage;

          submission.testCasesPassed =
            testCasesPassed;


          // ==========================================
// 9. UPDATE USER SOLVED PROBLEMS
// ==========================================

if (status === "accepted") {

    const user =
        await User.findById(
            submission.userId
        );

    if (user) {

        // Support old user documents where
        // problemSolved may not exist
        if (!Array.isArray(user.problemSolved)) {
            user.problemSolved = [];
        }

        const alreadySolved =
            user.problemSolved.some(
                id =>
                    id.toString() ===
                    problemId.toString()
            );

        if (!alreadySolved) {

            user.problemSolved.push(
                problemId
            );

            await user.save();

        }
    }
}

          // ==========================================
          // 10. SAVE FINAL SUBMISSION
          // ==========================================

          await submission.save();


          // ==========================================
          // 11. SEND FINAL UPDATE TO FRONTEND
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
                problem.hiddenTestcase.length

            })

          );


          return {
            success: true
          };

        }

        catch (err) {

          console.log(
            `Job ${job.id} Error:`,
            err.message
          );


          // Throwing is important because
          // BullMQ will retry the job.
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


        // Up to 8 submissions can be
        // processed concurrently.
        concurrency: 8

      }

    );


    // ==========================================
    // JOB STARTED
    // ==========================================

    worker.on(
      "active",
      (job) => {

        console.log(
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

        console.log(
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

        console.log(
          `Job ${job?.id} failed`
        );


        // BullMQ fires "failed" for an attempt that
        // failed. With attempts: 3, we should only
        // mark the DB submission permanently failed
        // after the final attempt.

        if (
          job &&
          job.attemptsMade <
            (job.opts.attempts || 1)
        ) {

          console.log(
            `Job ${job.id} will be retried. ` +
            `Attempt ${job.attemptsMade}/` +
            `${job.opts.attempts || 1}`
          );

          return;

        }


        console.log(
          `Job ${job?.id} failed permanently`
        );


        try {

          if (!job) {
            return;
          }


          const submission =
            await Submission.findById(
              job.data.submissionId
            );


          if (submission) {

            submission.status =
              "failed";

            submission.errorMessage =
              err.message;


            await submission.save();


            await publisher.publish(

              "submission-updates",

              JSON.stringify({

                submissionId:
                  submission._id.toString(),

                problemId:
                  submission.problemId.toString(),

                userId:
                  submission.userId.toString(),

                status: "failed",

                error:
                  err.message

              })

            );

          }

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
    // WORKER INTERNAL ERROR
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


    console.log("Worker Started");

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