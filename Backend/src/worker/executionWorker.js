const { Worker } = require("bullmq");
const Submission = require("../models/submission");
const Problem = require("../models/problem");
const { submitHiddenCode } = require("../utils/problemUtility");
const User = require("../models/user");
const publisher = require("../config/redisPublisher");
const { updateRuntimeEstimate } = require("../scheduler/runtimeEstimator");

const worker = new Worker(
  "execution",
  async (job) => {
    try {

      console.log(`Job ${job.id} Received`);

      const submission = await Submission.findById(
        job.data.submissionId
      );

      if (!submission) {
        throw new Error("Submission not found");
      }

      const problemId = submission.problemId;

      const problem = await Problem.findById(problemId);

      if (!problem) {
        throw new Error("Problem not found");
      }

      submission.status = "running";
      await submission.save();

      await publisher.publish(
        "submission-updates",
        JSON.stringify({
          submissionId: submission._id.toString(),
          problemId: submission.problemId.toString(),
          userId: submission.userId.toString(),
          status: "running"
        })
      );

      const testCaseArray = problem.hiddenTestcase.map(
        ({ input, output }) => ({
          code: submission.code,
          language: submission.language,
          input,
          output
        })
      );

      const result =
        await submitHiddenCode(testCaseArray,problem);

      let runtime = 0;
      let status = "accepted";
      let errorMessage = null;
      let testCasesPassed = 0;

      for (const test of result) {

        if (test.passed) {
          testCasesPassed++;
          runtime += test.runtime;
        }
        else {
          status = "wrong";
          errorMessage = test.error;
          break;
        }

      }

      if (status === "accepted" && runtime > 0) {
        await updateRuntimeEstimate(
          problem,
          submission.language,
          runtime
        );
      }

      submission.runtime = runtime;
      submission.memory = 0;
      submission.status = status;
      submission.errorMessage = errorMessage;
      submission.testCasesPassed = testCasesPassed;

      const user =
        await User.findById(submission.userId);

      

      if (
        status === "accepted" &&
        user &&
        !user.probelmSolved?.includes(problemId)
      ) {
        user.probelmSolved.push(problemId);
        await user.save();
      }

      await submission.save();


      await publisher.publish(
        "submission-updates",
        JSON.stringify({
          submissionId: submission._id.toString(),
          problemId: submission.problemId.toString(),
          userId: submission.userId.toString(),
          status,
          runtime,
          memory: 0,
          testCasesPassed,
          testCasesTotal: problem.hiddenTestcase.length
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

      throw err;

    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },

    concurrency: 8
  }
);


// Fired when worker starts processing
worker.on("active", (job) => {

  console.log(
    `Job ${job.id} is running`
  );

});


// Fired when job completes
worker.on("completed", (job) => {

  console.log(
    `Job ${job.id} completed successfully`
  );

});


// Fired after all retries fail
worker.on(
  "failed",
  async (job, err) => {

    console.log(
      `Job ${job.id} failed permanently`
    );

    try {

      const submission =
        await Submission.findById(
          job.data.submissionId
        );

      if (submission) {

        submission.status = "failed";

        submission.errorMessage =
          err.message;

        await submission.save();
        await publisher.publish(
          "submission-updates",
          JSON.stringify({
            submissionId: submission._id.toString(),
            problemId: submission.problemId.toString(),
            userId: submission.userId.toString(),
            status: "failed",
            error: err.message
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

console.log("Worker Started");