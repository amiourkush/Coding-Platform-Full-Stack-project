const ALPHA = 0.2;


/**
 * Updates historical runtime estimate for a
 * particular problem + programming language.
 *
 * Uses EWMA:
 *
 * newEstimate =
 * ALPHA * actualRuntime +
 * (1 - ALPHA) * oldEstimate
 */
async function updateRuntimeEstimate(
    problem,
    language,
    actualRuntime
) {

    // Normalize language so "C++" and "c++"
    // don't become separate entries.
    const normalizedLanguage =
        language.toLowerCase();


    // Safety for old problem documents that
    // were created before runtimeStats existed.
    if (!problem.runtimeStats) {
        problem.runtimeStats = [];
    }


    // Find existing statistics for this language.
    const stats =
        problem.runtimeStats.find(
            stat =>
                stat.language.toLowerCase() ===
                normalizedLanguage
        );


    // -----------------------------------------
    // FIRST OBSERVATION
    // -----------------------------------------

    if (!stats) {

        problem.runtimeStats.push({

            language: normalizedLanguage,

            estimatedRuntime:
                Number(actualRuntime),

            executionCount: 1

        });

    }


    // -----------------------------------------
    // EXISTING HISTORY
    // -----------------------------------------

    else {

        const oldEstimate =
            Number(stats.estimatedRuntime) || 0;

        const runtime =
            Number(actualRuntime);


        stats.estimatedRuntime =
            ALPHA * runtime +
            (1 - ALPHA) * oldEstimate;


        stats.executionCount =
            (stats.executionCount || 0) + 1;

    }


    // Save updated runtimeStats into MongoDB.
    await problem.save();


    // Debug information
    const updatedStats =
        problem.runtimeStats.find(
            stat =>
                stat.language.toLowerCase() ===
                normalizedLanguage
        );


    console.log(
        `[Runtime Estimator]
Problem=${problem._id}
Language=${normalizedLanguage}
ActualRuntime=${actualRuntime}ms
EstimatedRuntime=${updatedStats?.estimatedRuntime}ms
ExecutionCount=${updatedStats?.executionCount}`
    );

}


/**
 * Returns current estimated runtime.
 *
 * Returns null if we don't have runtime
 * information for this language yet.
 */
function getRuntimeEstimate(
    problem,
    language
) {

    if (!problem.runtimeStats) {
        return null;
    }


    const normalizedLanguage =
        language.toLowerCase();


    const stats =
        problem.runtimeStats.find(
            stat =>
                stat.language.toLowerCase() ===
                normalizedLanguage
        );


    if (
        !stats ||
        !stats.executionCount ||
        stats.executionCount <= 0
    ) {

        return null;

    }


    return stats.estimatedRuntime;
}


module.exports = {
    updateRuntimeEstimate,
    getRuntimeEstimate
};