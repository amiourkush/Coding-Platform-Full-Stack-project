const ALPHA = 0.2;

async function updateRuntimeEstimate(
    problem,
    language,
    actualRuntime
) {

    let stats = problem.runtimeStats.find(
        stat => stat.language === language
    );

    // First observation for this language
    if (!stats) {

        problem.runtimeStats.push({
            language,
            estimatedRuntime: actualRuntime,
            executionCount: 1
        });

    } else {

        stats.estimatedRuntime =
            ALPHA * actualRuntime +
            (1 - ALPHA) * stats.estimatedRuntime;

        stats.executionCount++;
    }

    await problem.save();
}


function getRuntimeEstimate(problem, language) {

    const stats = problem.runtimeStats.find(
        stat => stat.language === language
    );

    // Not enough historical information
    if (!stats || stats.executionCount === 0) {
        return null;
    }

    return stats.estimatedRuntime;
}


module.exports = {
    updateRuntimeEstimate,
    getRuntimeEstimate
};