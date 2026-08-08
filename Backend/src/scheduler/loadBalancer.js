const executorRegistry = require("./executorRegistry");


// Minimum historical executions before
// trusting estimatedRuntime
const MIN_HISTORY = 3;


// Cost assigned to a job whose runtime
// is currently unknown
const DEFAULT_UNKNOWN_COST = 1000;


// Read scheduler mode from .env
//
// Possible values:
//
// ROUND_ROBIN
// LEAST_CONNECTIONS
// WORKLOAD_AWARE
//
const SCHEDULER_MODE =
    (process.env.SCHEDULER_MODE ||
        "WORKLOAD_AWARE").toUpperCase();


class LoadBalancer {

    constructor() {

        // Used only by Round Robin
        this.currentIndex = 0;

    }


    // =====================================================
    // COMMON SCORE
    // =====================================================

    calculateScore(executor) {

        return (
            executor.estimatedLoad +
            executor.unknownJobs *
            DEFAULT_UNKNOWN_COST
        );

    }


    // =====================================================
    // 1. ROUND ROBIN
    // =====================================================

    getRoundRobinExecutor(executors) {

        const executor =
            executors[
                this.currentIndex %
                executors.length
            ];

        this.currentIndex++;

        return executor;

    }


    // =====================================================
    // 2. LEAST CONNECTIONS
    // =====================================================

    getLeastConnectionsExecutor(executors) {

        let selectedExecutor =
            executors[0];


        for (
            let i = 1;
            i < executors.length;
            i++
        ) {

            const executor =
                executors[i];


            // Primary criterion:
            // number of active submissions
            if (
                executor.activeJobs <
                selectedExecutor.activeJobs
            ) {

                selectedExecutor =
                    executor;

            }


            // Tie breaker:
            // use estimated workload
            else if (
                executor.activeJobs ===
                selectedExecutor.activeJobs
            ) {

                const currentScore =
                    this.calculateScore(
                        selectedExecutor
                    );

                const newScore =
                    this.calculateScore(
                        executor
                    );


                if (
                    newScore <
                    currentScore
                ) {

                    selectedExecutor =
                        executor;

                }

            }

        }


        return selectedExecutor;

    }


    // =====================================================
    // 3. WORKLOAD AWARE
    // =====================================================

    getWorkloadAwareExecutor(executors) {

        let selectedExecutor =
            executors[0];


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
                this.calculateScore(
                    executor
                );


            // Lower predicted workload wins
            if (
                score <
                minimumScore
            ) {

                selectedExecutor =
                    executor;

                minimumScore =
                    score;

            }


            // Tie breaker:
            // fewer active jobs
            else if (
                score ===
                minimumScore &&
                executor.activeJobs <
                selectedExecutor.activeJobs
            ) {

                selectedExecutor =
                    executor;

            }

        }


        return selectedExecutor;

    }


    // =====================================================
    // MAIN SCHEDULER
    // =====================================================

    getExecutor(runtimeStats) {

        const executors =
            executorRegistry
                .getHealthyExecutors();


        if (
            executors.length === 0
        ) {

            throw new Error(
                "No healthy executors available"
            );

        }


        // -------------------------------------------------
        // Determine whether we have reliable history
        // -------------------------------------------------

        const hasReliableEstimate =
            runtimeStats &&
            runtimeStats.executionCount >=
                MIN_HISTORY &&
            runtimeStats.estimatedRuntime > 0;


        const estimatedRuntime =
            hasReliableEstimate
                ? runtimeStats.estimatedRuntime
                : 0;


        // -------------------------------------------------
        // Choose executor
        // -------------------------------------------------

        let selectedExecutor;


        if (
            SCHEDULER_MODE ===
            "ROUND_ROBIN"
        ) {

            selectedExecutor =
                this.getRoundRobinExecutor(
                    executors
                );

        }


        else if (
            SCHEDULER_MODE ===
            "LEAST_CONNECTIONS"
        ) {

            selectedExecutor =
                this.getLeastConnectionsExecutor(
                    executors
                );

        }


        else if (
            SCHEDULER_MODE ===
            "WORKLOAD_AWARE"
        ) {

            selectedExecutor =
                this.getWorkloadAwareExecutor(
                    executors
                );

        }


        else {

            throw new Error(
                `Invalid SCHEDULER_MODE: ${SCHEDULER_MODE}`
            );

        }


        // -------------------------------------------------
        // Reserve executor
        // -------------------------------------------------

        executorRegistry
            .incrementActiveJobs(
                selectedExecutor.id
            );


        if (
            hasReliableEstimate
        ) {

            executorRegistry
                .addEstimatedLoad(
                    selectedExecutor.id,
                    estimatedRuntime
                );

        }

        else {

            executorRegistry
                .incrementUnknownJobs(
                    selectedExecutor.id
                );

        }


        // -------------------------------------------------
        // Calculate score after reservation
        // -------------------------------------------------

        const scoreAfter =
            this.calculateScore(
                selectedExecutor
            );


        // -------------------------------------------------
        // Logging
        // -------------------------------------------------

        console.log(
`
[Scheduler]

Mode=${SCHEDULER_MODE}

Strategy=${
    SCHEDULER_MODE ===
    "WORKLOAD_AWARE"
        ? (
            hasReliableEstimate
                ? "WORKLOAD_AWARE"
                : "UNKNOWN_WORKLOAD"
          )
        : SCHEDULER_MODE
}

Executor=${selectedExecutor.id}

ActiveJobs=${selectedExecutor.activeJobs}

EstimatedLoad=${selectedExecutor.estimatedLoad}

UnknownJobs=${selectedExecutor.unknownJobs}

ScoreAfter=${scoreAfter}

JobEstimate=${estimatedRuntime}ms

ReliableEstimate=${hasReliableEstimate}
`
        );


        // -------------------------------------------------
        // IMPORTANT
        // Worker already expects this structure
        // -------------------------------------------------

        return {

            executor:
                selectedExecutor,

            estimatedRuntime,

            hasReliableEstimate

        };

    }


    // =====================================================
    // RELEASE EXECUTOR
    // =====================================================

    releaseExecutor(
        executorId,
        estimatedRuntime,
        hasReliableEstimate
    ) {

        executorRegistry
            .decrementActiveJobs(
                executorId
            );


        if (
            hasReliableEstimate
        ) {

            executorRegistry
                .removeEstimatedLoad(
                    executorId,
                    estimatedRuntime
                );

        }

        else {

            executorRegistry
                .decrementUnknownJobs(
                    executorId
                );

        }


        executorRegistry
            .incrementCompletedJobs(
                executorId
            );


        console.log(
            `[Scheduler] ${executorId} released`
        );

    }

}


module.exports =
    new LoadBalancer();