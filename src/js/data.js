
// Colors for groups to rotate through
const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#E7E9ED', '#71B37C', '#EC932F', '#5D4C46', '#2A2B2D', '#8C4646'
];

/**
 * Parses raw input text or CSV string.
 * Expected format: Name, Group, Weight
 * @param {string} input
 * @returns {Array} Array of objects {name, group, weight}
 */
export function parseData(input) {
    if (!input) return [];

    const lines = input.split(/\r?\n/);
    const data = [];

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // Split by comma
        const parts = line.split(',');

        // Handle cases with fewer columns
        let name = parts[0] ? parts[0].trim() : '';
        let group = parts[1] ? parts[1].trim() : 'Default';
        let weight = parts[2] ? parseFloat(parts[2]) : 1;

        if (isNaN(weight) || weight <= 0) weight = 1;

        if (name) {
            data.push({ name, group, weight });
        }
    });

    return data;
}

/**
 * Calculates segments for the wheel based on weighting strategy.
 * @param {Array} data - Array of {name, group, weight}
 * @param {string} strategy - 'individual' or 'group'
 * @returns {Array} Array of segments with startAngle, endAngle, color, label
 */
export function calculateSegments(data, strategy = 'individual') {
    if (data.length === 0) return [];

    let segments = [];
    let totalWeight = 0;

    // Assign colors to groups
    const groups = [...new Set(data.map(d => d.group))];
    const groupColors = {};
    groups.forEach((g, i) => {
        groupColors[g] = COLORS[i % COLORS.length];
    });

    if (strategy === 'individual') {
        // Simple case: prob = weight / totalWeight
        totalWeight = data.reduce((sum, item) => sum + item.weight, 0);

        let currentAngle = 0;
        data.forEach(item => {
            const angleSize = (item.weight / totalWeight) * 2 * Math.PI;
            segments.push({
                name: item.name,
                group: item.group,
                startAngle: currentAngle,
                endAngle: currentAngle + angleSize,
                color: groupColors[item.group],
                weight: item.weight // Store original weight for reference
            });
            currentAngle += angleSize;
        });

    } else if (strategy === 'group') {
        // Hierarchical: Groups get equal weight (or could be custom), items inside share group space
        // For this implementation: Groups get EQUAL weight on the wheel.
        const numGroups = groups.length;
        const anglePerGroup = (2 * Math.PI) / numGroups;

        let currentAngle = 0;

        // Process each group
        groups.forEach(groupName => {
            const groupItems = data.filter(d => d.group === groupName);
            const groupTotalWeight = groupItems.reduce((sum, item) => sum + item.weight, 0);

            // Distribute items within the group's angle slice
            groupItems.forEach(item => {
                // Determine item's share within the group
                const itemFraction = item.weight / groupTotalWeight;
                const itemAngleSize = itemFraction * anglePerGroup;

                segments.push({
                    name: item.name,
                    group: item.group,
                    startAngle: currentAngle,
                    endAngle: currentAngle + itemAngleSize,
                    color: groupColors[item.group],
                    weight: item.weight
                });
                currentAngle += itemAngleSize;
            });
        });
    }

    return segments;
}
