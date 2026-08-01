class ExecutorRegistry {

    constructor() {

        this.executors = [
            {
                id: "executor1",
                url: "http://localhost:4001",
                healthy: true,

                // Total submissions currently assigned
                activeJobs: 0,

                // Predicted runtime of KNOWN active jobs
                estimatedLoad: 0,

                // Active jobs for which we don't have
                // reliable historical runtime
                unknownJobs: 0,

                completedJobs: 0
            },

            {
                id: "executor2",
                url: "http://localhost:4002",
                healthy: true,
                activeJobs: 0,
                estimatedLoad: 0,
                unknownJobs: 0,
                completedJobs: 0
            },

            {
                id: "executor3",
                url: "http://localhost:4003",
                healthy: true,
                activeJobs: 0,
                estimatedLoad: 0,
                unknownJobs: 0,
                completedJobs: 0
            },

            {
                id: "executor4",
                url: "http://localhost:4004",
                healthy: true,
                activeJobs: 0,
                estimatedLoad: 0,
                unknownJobs: 0,
                completedJobs: 0
            }
        ];
    }


    // ---------------------------------
    // GETTERS
    // ---------------------------------

    getExecutors() {
        return this.executors;
    }


    getHealthyExecutors() {
        return this.executors.filter(
            executor => executor.healthy
        );
    }


    // ---------------------------------
    // ACTIVE JOBS
    // ---------------------------------

    incrementActiveJobs(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {
            executor.activeJobs++;
        }
    }


    decrementActiveJobs(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (
            executor &&
            executor.activeJobs > 0
        ) {
            executor.activeJobs--;
        }
    }


    // ---------------------------------
    // ESTIMATED LOAD
    // ---------------------------------

    addEstimatedLoad(id, runtime) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {
            executor.estimatedLoad += runtime;
        }
    }


    removeEstimatedLoad(id, runtime) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {

            executor.estimatedLoad =
                Math.max(
                    0,
                    executor.estimatedLoad - runtime
                );
        }
    }


    // ---------------------------------
    // UNKNOWN JOBS
    // ---------------------------------

    incrementUnknownJobs(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {
            executor.unknownJobs++;
        }
    }


    decrementUnknownJobs(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (
            executor &&
            executor.unknownJobs > 0
        ) {
            executor.unknownJobs--;
        }
    }


    // ---------------------------------
    // COMPLETED JOBS
    // ---------------------------------

    incrementCompletedJobs(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {
            executor.completedJobs++;
        }
    }


    // ---------------------------------
    // HEALTH
    // ---------------------------------

    markHealthy(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {
            executor.healthy = true;
        }
    }


    markUnhealthy(id) {

        const executor =
            this.executors.find(e => e.id === id);

        if (executor) {
            executor.healthy = false;
        }
    }

}


module.exports = new ExecutorRegistry();