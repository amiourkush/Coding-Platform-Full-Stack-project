const executorRegistry =require("./executorRegistry");


// Minimum historical executions before
// trusting estimatedRuntime
const MIN_HISTORY = 3;


// Temporary estimated cost of a job
// when we don't know its runtime.
//
// Later we'll replace this with
// historical global/language averages.
const DEFAULT_UNKNOWN_COST = 1000;


class LoadBalancer {


    // ---------------------------------
    // Calculate current executor score
    // ---------------------------------

    calculateScore(executor) {

        return (
            executor.estimatedLoad +
            executor.unknownJobs * DEFAULT_UNKNOWN_COST
        );
    }


    // ---------------------------------
    // Choose executor
    // ---------------------------------

    getExecutor(runtimeStats) {

        const executors =
            executorRegistry.getHealthyExecutors();


        if (executors.length === 0) {

            throw new Error(
                "No healthy executors available"
            );
        }


        // Can we trust historical runtime?

        const hasReliableEstimate =
            runtimeStats &&
            runtimeStats.executionCount >= MIN_HISTORY &&
            runtimeStats.estimatedRuntime > 0;


        const estimatedRuntime =
            hasReliableEstimate
                ? runtimeStats.estimatedRuntime
                : 0;


        // ---------------------------------
        // Find executor with minimum score
        // ---------------------------------

        let selectedExecutor = executors[0];

        let minimumScore =
            this.calculateScore(
                selectedExecutor
            );


        for (
            let i = 1;
            i < executors.length;
            i++
        ) {

            const executor =
                executors[i];

            const score =
                this.calculateScore(executor);


            // Lower workload score wins

            if (score < minimumScore) {

                selectedExecutor = executor;
                minimumScore = score;

            }

            // ---------------------------------
            // Tie breaker
            //
            // If scores are equal,
            // choose fewer active jobs.
            // ---------------------------------

            else if (
                score === minimumScore &&
                executor.activeJobs <
                selectedExecutor.activeJobs
            ) {

                selectedExecutor = executor;
                minimumScore = score;

            }
        }


        // ---------------------------------
        // Reserve executor capacity
        // ---------------------------------

        executorRegistry.incrementActiveJobs(
            selectedExecutor.id
        );


        if (hasReliableEstimate) {

            // Known workload

            executorRegistry.addEstimatedLoad(
                selectedExecutor.id,
                estimatedRuntime
            );

        }

        else {

            // Unknown workload

            executorRegistry.incrementUnknownJobs(
                selectedExecutor.id
            );
        }


        const newScore =
            this.calculateScore(
                selectedExecutor
            );


        console.log(
            `[Scheduler]
Strategy=${hasReliableEstimate ? "WORKLOAD_AWARE" : "UNKNOWN_WORKLOAD"}
Executor=${selectedExecutor.id}
ScoreBefore=${minimumScore}
ScoreAfter=${newScore}
ActiveJobs=${selectedExecutor.activeJobs}
EstimatedLoad=${selectedExecutor.estimatedLoad}
UnknownJobs=${selectedExecutor.unknownJobs}
JobEstimate=${estimatedRuntime}ms`
        );


        // IMPORTANT:
        // return everything required later
        // to release the exact reservation.

        return {

            executor: selectedExecutor,

            estimatedRuntime,

            hasReliableEstimate
        };
    }


    // ---------------------------------
    // Submission finished
    // ---------------------------------

    releaseExecutor(
        executorId,
        estimatedRuntime,
        hasReliableEstimate
    ) {

        executorRegistry.decrementActiveJobs(
            executorId
        );


        if (hasReliableEstimate) {

            executorRegistry.removeEstimatedLoad(
                executorId,
                estimatedRuntime
            );

        }

        else {

            executorRegistry.decrementUnknownJobs(
                executorId
            );
        }


        executorRegistry.incrementCompletedJobs(
            executorId
        );


        console.log(
            `[Scheduler] ${executorId} released`
        );
    }

}


module.exports = new LoadBalancer();